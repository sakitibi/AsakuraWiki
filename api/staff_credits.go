package handler

import (
	"bytes"
	"compress/gzip"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"regexp"
	"strconv"
	"strings"
	"sync"

	"github.com/andybalholm/brotli"
)

// JSONProps はレスポンスのスタッフデータ構造体
type JSONProps struct {
	ID       int    `json:"id"`
	Name     string `json:"name"`
	Kana     string `json:"kana"`
	Dept     string `json:"dept"`
	Location string `json:"location"`
	Seat     string `json:"seat"`
	Joined   string `json:"joined"`
	Team     string `json:"team"`
	Birthday string `json:"birthday,omitempty"`
	Intro    string `json:"intro,omitempty"`
	Comment  string `json:"comment,omitempty"`
}

type StaffDataResponse struct {
	StaffData []JSONProps `json:"staff_data"`
}

// Supabase User 取得用レスポンス構造体
type SupabaseUserResponse struct {
	ID string `json:"id"`
}

// 管理者ユーザーIDリスト (元の adminerUserId に相当)
var adminerUserId = map[string]bool{
	"USER_ID_1": true,
	"USER_ID_2": true,
}

var birthdayRegex = regexp.MustCompile(`\b(?:19\d{2}|200\d)年(\d{1,2})月(\d{1,2})日`)

// 単一のURLを処理するヘルパー関数 (fetchAndDecompress に相当)
func fetchAndDecompress(url string) ([]JSONProps, error) {
	resp, err := http.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("failed to fetch %s: %s", url, resp.Status)
	}

	// Brotli 解凍
	brReader := brotli.NewReader(resp.Body)
	body, err := io.ReadAll(brReader)
	if err != nil {
		return nil, err
	}

	var data StaffDataResponse
	if err := json.Unmarshal(body, &data); err != nil {
		return nil, err
	}

	return data.StaffData, nil
}

// Supabase Server API を使用してユーザー情報を取得
func getSupabaseUser(authHeader string) (*SupabaseUserResponse, error) {
	supabaseURL := strings.TrimSpace(os.Getenv("NEXT_PUBLIC_SUPABASE_URL"))
	supabaseAnonKey := strings.TrimSpace(os.Getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY"))

	if supabaseURL == "" || supabaseAnonKey == "" || authHeader == "" {
		return nil, nil
	}

	token := strings.TrimSpace(authHeader)
	if strings.HasPrefix(strings.ToLower(token), "bearer ") {
		token = strings.TrimSpace(token[7:])
	}

	// トークン自体が存在しない場合は失敗
	if token == "" {
		log.Printf("Auth check failed: Token is empty")
		return nil, nil
	}

	req, err := http.NewRequest("GET", fmt.Sprintf("%s/auth/v1/user", supabaseURL), nil)
	if err != nil {
		return nil, err
	}

	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", token))
	req.Header.Set("apikey", supabaseAnonKey)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		log.Printf("Supabase auth request failed: %v", err)
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		bodyBytes, _ := io.ReadAll(resp.Body)
		log.Printf("Supabase Auth Error Status: %d, Response: %s", resp.StatusCode, string(bodyBytes))
		return nil, fmt.Errorf("auth error: status %d", resp.StatusCode)
	}

	var user SupabaseUserResponse
	if err := json.NewDecoder(resp.Body).Decode(&user); err != nil {
		log.Printf("Failed to decode Supabase user: %v", err)
		return nil, err
	}

	return &user, nil
}

// エントリーポイント Handler
func Handler(w http.ResponseWriter, r *http.Request) {
	// CORS ヘッダーの設定
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, x-data-type")
	w.Header().Set("Access-Control-Allow-Methods", "GET,OPTIONS")

	defer func() {
		if r := recover(); r != nil {
			log.Printf("Recovered from panic: %v", r)
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{
				"error": "予期せぬ内部エラーが発生しました",
			})
		}
	}()

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	if r.Method != http.MethodGet {
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}

	// 取得対象のURLリスト
	baseURL := "https://sakitibi.github.io/14nin.com/staff_credits/staff_data_"
	urls := []string{
		baseURL + "1_64.json.br",
		baseURL + "65_128.json.br",
		baseURL + "129_192.json.br",
		baseURL + "193_256.json.br",
		baseURL + "257_320.json.br",
	}

	// 認証チェック
	authHeader := r.Header.Get("Authorization")
	user, err := getSupabaseUser(authHeader)
	if err != nil {
		log.Printf("Auth check error: %v", err)
	}

	userID := ""
	if user != nil {
		userID = user.ID
	}

	isAdmin := adminerUserId[userID]
	if !isAdmin {
		log.Printf("Unauthorized access attempt. UserID: %s", userID)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]string{"error": "Unauthorized"})
		return
	}

	// すべてのURLを並列処理
	type resultStruct struct {
		index int
		data  []JSONProps
		err   error
	}

	ch := make(chan resultStruct, len(urls))
	var wg sync.WaitGroup

	for index, url := range urls {
		wg.Add(1)
		go func(i int, u string) {
			defer wg.Done()
			data, err := fetchAndDecompress(u)
			ch <- resultStruct{index: i, data: data, err: err}
		}(index, url)
	}

	wg.Wait()
	close(ch)

	resultsMap := make(map[int][]JSONProps)
	for res := range ch {
		if res.err != nil {
			log.Printf("Batch Processing Error: %v", res.err)

			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{
				"error": "一部またはすべてのデータの取得・解凍に失敗しました",
			})
			return
		}
		resultsMap[res.index] = res.data
	}

	// 取得した配列の結合
	var staffData []JSONProps
	for i := range len(urls) {
		staffData = append(staffData, resultsMap[i]...)
	}

	log.Printf("staff_data count: %d", len(staffData))

	// 生年月日の置換処理
	results := make([]JSONProps, len(staffData))
	for index, data := range staffData {
		shouldSkipReplace := (index >= 77 && index <= 80) || (index >= 83 && index <= 90)

		if data.Birthday != "" {
			if shouldSkipReplace {
				var year string
				switch index {
				case 85:
					year = "2019"
				case 83:
					year = "2018"
				case 77, 86, 87:
					year = "2016"
				case 78, 88:
					year = "2015"
				case 79, 80, 90:
					year = "2014"
				}

				data.Birthday = birthdayRegex.ReplaceAllStringFunc(data.Birthday, func(match string) string {
					submatches := birthdayRegex.FindStringSubmatch(match)
					if len(submatches) < 3 {
						return match
					}
					return fmt.Sprintf("%s年%s月%s日", year, submatches[1], submatches[2])
				})
			} else {
				data.Birthday = birthdayRegex.ReplaceAllStringFunc(data.Birthday, func(match string) string {
					submatches := birthdayRegex.FindStringSubmatch(match)
					if len(submatches) < 3 {
						return match
					}
					m, _ := strconv.Atoi(submatches[1])
					d, _ := strconv.Atoi(submatches[2])

					isBeforeApril := (m >= 1 && m <= 3) || (m == 4 && d == 1)
					if isBeforeApril {
						return fmt.Sprintf("2014年%d月%d日", m, d)
					}
					return fmt.Sprintf("2013年%d月%d日", m, d)
				})
			}
		}
		results[index] = data
	}

	log.Printf("results count: %d", len(results))

	// レスポンスの作成・圧縮
	jsonBytes, err := json.Marshal(results)
	if err != nil {
		log.Printf("JSON Marshal error: %v", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/octet-stream")

	if r.Header.Get("x-data-type") == "gzip" {
		var buf bytes.Buffer
		gzWriter, _ := gzip.NewWriterLevel(&buf, gzip.BestCompression)
		gzWriter.Write(jsonBytes)
		gzWriter.Close()

		w.WriteHeader(http.StatusOK)
		w.Write(buf.Bytes())
	} else {
		var buf bytes.Buffer
		brWriter := brotli.NewWriterLevel(&buf, brotli.BestCompression)
		brWriter.Write(jsonBytes)
		brWriter.Close()

		w.Header().Set("Content-Length", strconv.Itoa(buf.Len()))
		w.WriteHeader(http.StatusOK)
		w.Write(buf.Bytes())
	}
}
