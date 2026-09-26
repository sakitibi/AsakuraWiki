package handler

import (
	"bytes"
	"compress/gzip"
	"encoding/json"
	"log"
	"net/http"
	"strconv"
	"sync"

	"asakura-wiki.vercel.app/pkg"
	"asakura-wiki.vercel.app/pkg/staff"

	"github.com/andybalholm/brotli"
)

func Handler(w http.ResponseWriter, r *http.Request) {
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

	baseURL := "https://sakitibi.github.io/14nin.com/staff_credits/staff_data_"
	urls := []string{
		baseURL + "1_64.json.br",
		baseURL + "65_128.json.br",
		baseURL + "129_192.json.br",
		baseURL + "193_256.json.br",
		baseURL + "257_320.json.br",
		baseURL + "321_384.json.br",
	}

	authHeader := r.Header.Get("Authorization")
	user, err := pkg.GetSupabaseUser(authHeader)
	if err != nil {
		log.Printf("Auth check error: %v", err)
	}

	userID := ""
	if user != nil {
		userID = user.ID
	}

	isAdmin := pkg.AdminerUserId[userID]
	if !isAdmin {
		log.Printf("Unauthorized access attempt. UserID: %s", userID)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]string{"error": "Unauthorized"})
		return
	}

	type resultStruct struct {
		index int
		data  []staff.JSONProps
		err   error
	}

	ch := make(chan resultStruct, len(urls))
	var wg sync.WaitGroup

	for index, url := range urls {
		wg.Add(1)
		go func(i int, u string) {
			defer wg.Done()
			data, err := staff.FetchAndDecompress(u)
			ch <- resultStruct{index: i, data: data, err: err}
		}(index, url)
	}

	wg.Wait()
	close(ch)

	resultsMap := make(map[int][]staff.JSONProps)
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

	var staffData []staff.JSONProps
	for i := range len(urls) {
		staffData = append(staffData, resultsMap[i]...)
	}

	results := staff.ProcessBirthdays(staffData)

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
