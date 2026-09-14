package amongus

import (
	"bytes"
	"compress/gzip"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"
	"time"
)

type AmongUsUserRequest struct {
	Puid          string `json:"Puid"`
	Username      string `json:"Username"`
	ClientVersion int    `json:"ClientVersion"`
	Language      int    `json:"Language"`
}

type SupabaseUpdatePayload struct {
	Value     string    `json:"value"`
	UpdatedAt time.Time `json:"updated_at"`
}

// Among Us API への POST リクエストを実行
func FetchAmongUsUser(authToken string) (string, int, error) {
	apiURL := "https://matchmaker-as.among.us/api/user"

	payload := AmongUsUserRequest{
		Puid:          "0002d597a46a4c7dad0eac919ff5baed",
		Username:      "14人TVバン70回",
		ClientVersion: 50656250,
		Language:      11,
	}

	jsonBytes, err := json.Marshal(payload)
	if err != nil {
		return "", 0, err
	}

	req, err := http.NewRequest("POST", apiURL, bytes.NewBuffer(jsonBytes))
	if err != nil {
		return "", 0, err
	}

	// ヘッダー設定
	req.Header.Set("Host", "matchmaker-as.among.us")
	req.Header.Set("X-Unity-Version", "2022.3.44f1")
	req.Header.Set("Accept", "text/plain")
	req.Header.Set("baggage", "sentry-environment=production,sentry-public_key=7d060819d94d41f3ab7569154dccdcd5,sentry-release=Among%20Us%402026.4.7,sentry-trace_id=ab4fcbbca8194bcea5ac9be5a6aff102")
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", authToken))
	req.Header.Set("Accept-Encoding", "gzip, deflate")
	req.Header.Set("sentry-trace", "ab4fcbbca8194bcea5ac9be5a6aff102-8783ca69fcb04104-0")
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("User-Agent", "AmongUs/1 CFNetwork/3860.500.112 Darwin/25.4.0")
	req.Header.Set("Connection", "keep-alive")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", 0, err
	}
	defer resp.Body.Close()

	var reader io.Reader = resp.Body
	if resp.Header.Get("Content-Encoding") == "gzip" {
		gzReader, err := gzip.NewReader(resp.Body)
		if err != nil {
			return "", resp.StatusCode, err
		}
		defer gzReader.Close()
		reader = gzReader
	}

	bodyBytes, err := io.ReadAll(reader)
	if err != nil {
		return "", resp.StatusCode, err
	}

	return string(bodyBytes), resp.StatusCode, nil
}

func UpdateWikiVariable(data string) error {
	supabaseURL := os.Getenv("NEXT_PUBLIC_SUPABASE_URL")
	anonKey := os.Getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")

	targetID := "9cc08dca-cf55-4639-9ad1-42e1b67f53b9"

	cleanURL := strings.TrimSpace(supabaseURL)
	cleanID := strings.TrimSpace(targetID)

	endpoint := fmt.Sprintf("%s/rest/v1/wiki_variables?id=eq.%s", cleanURL, cleanID)

	cleanedData := strings.ReplaceAll(data, "\u0000", "")

	updateData := SupabaseUpdatePayload{
		Value:     cleanedData,
		UpdatedAt: time.Now(),
	}

	jsonBytes, err := json.Marshal(updateData)
	if err != nil {
		return err
	}

	req, err := http.NewRequest("PATCH", endpoint, bytes.NewBuffer(jsonBytes))
	if err != nil {
		return err
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("apikey", anonKey)
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", anonKey))
	req.Header.Set("Prefer", "return=minimal")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		bodyBytes, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("supabase update failed with status: %d, response: %s", resp.StatusCode, string(bodyBytes))
	}

	return nil
}
