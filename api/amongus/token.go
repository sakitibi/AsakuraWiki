package handler

import (
	"bytes"
	"compress/gzip"
	"crypto/rand"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"strings"
	"time"

	"github.com/sakitibi/upack.go/sencode"
)

type WikiVariable struct {
	Value     string    `json:"value"`
	UpdatedAt time.Time `json:"updated_at"`
}

type EpicTokenResponse struct {
	IDToken string `json:"id_token"`
}

// 暗号学的に安全なランダム文字列を生成
func generateRandomString(length int) string {
	const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_"
	bytes := make([]byte, length)
	if _, err := rand.Read(bytes); err != nil {
		return ""
	}
	for i, b := range bytes {
		bytes[i] = chars[b%byte(len(chars))]
	}
	return string(bytes)
}

// 基準日時が現在より1日以上前かチェック
func isOneDayEarlier(referenceDate time.Time) bool {
	return time.Since(referenceDate) >= 24*time.Hour
}

func TokenHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, PUT, OPTIONS")

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	supabaseURL := strings.TrimSpace(os.Getenv("NEXT_PUBLIC_SUPABASE_URL"))
	serviceKey := strings.TrimSpace(os.Getenv("SUPABASE_SERVICE_ROLE_KEY"))
	targetID := "a7869bcb-1c09-b4b2-4939-d382a5f27247"

	// ----------------------------------------------------
	// GET リクエスト処理
	// ----------------------------------------------------
	if r.Method == http.MethodGet {
		// Supabase からデータ取得
		reqURL := fmt.Sprintf("%s/rest/v1/wiki_variables?id=eq.%s&select=value,updated_at", supabaseURL, targetID)
		req, err := http.NewRequest("GET", reqURL, nil)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		req.Header.Set("apikey", serviceKey)
		req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", serviceKey))

		client := &http.Client{}
		resp, err := client.Do(req)
		if err != nil || resp.StatusCode != http.StatusOK {
			http.Error(w, "Failed to fetch from supabase", http.StatusInternalServerError)
			return
		}
		defer resp.Body.Close()

		var vars []WikiVariable
		if err := json.NewDecoder(resp.Body).Decode(&vars); err != nil || len(vars) == 0 {
			http.Error(w, "Data not found", http.StatusInternalServerError)
			return
		}
		data := vars[0]

		// Epic Games API へのリクエスト
		formData := url.Values{}
		formData.Set("grant_type", "external_auth")
		formData.Set("external_auth_type", "apple_id_token")
		formData.Set("external_auth_token", data.Value)
		formData.Set("deployment_id", "503cd077a7804777aee5a6eeb5cfe62d")
		formData.Set("nonce", generateRandomString(22))
		formData.Set("display_name", "14人TVバン70回")

		epicReq, err := http.NewRequest("POST", "https://api.epicgames.dev/auth/v1/oauth/token", strings.NewReader(formData.Encode()))
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		epicReq.Header.Set("Connection", "keep-alive")
		epicReq.Header.Set("User-Agent", "EOS-SDK/1.19.0.3-49960398 (IOS/26.5) AmongUs/1.0")
		epicReq.Header.Set("X-EOS-Version", "1.19.0.3-49960398")
		epicReq.Header.Set("X-Epic-Correlation-ID", "EOS-j1paBsBeRC6OSGsH0uOGOQ-9n1cSWXfQ_-jpuL2BMBJcg")
		epicReq.Header.Set("Host", "api.epicgames.dev")
		epicReq.Header.Set("Accept", "application/json")
		epicReq.Header.Set("Authorization", fmt.Sprintf("Basic %s", os.Getenv("AMONG_EPICAPIKEY")))
		epicReq.Header.Set("Accept-Language", "ja")
		epicReq.Header.Set("Accept-Encoding", "gzip")
		epicReq.Header.Set("Content-Type", "application/x-www-form-urlencoded")

		epicResp, err := client.Do(epicReq)
		if err != nil || epicResp.StatusCode != http.StatusOK {
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{"error": "oauth_token failed."})
			return
		}
		defer epicResp.Body.Close()

		var reader io.Reader = epicResp.Body
		if epicResp.Header.Get("Content-Encoding") == "gzip" {
			gzReader, err := gzip.NewReader(epicResp.Body)
			if err != nil {
				http.Error(w, "Failed to create gzip reader", http.StatusInternalServerError)
				return
			}
			defer gzReader.Close()
			reader = gzReader
		}

		var resdata EpicTokenResponse
		if err := json.NewDecoder(reader).Decode(&resdata); err != nil {
			http.Error(w, "Invalid epic response", http.StatusInternalServerError)
			return
		}

		// バリデーションチェック
		if data.Value == "" || isOneDayEarlier(data.UpdatedAt) {
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{"error": "token is null"})
			return
		}

		keys := strings.Split(os.Getenv("NEXT_PUBLIC_UPACK_B64KEYPAIR"), ",")
		if len(keys) < 1 {
			http.Error(w, "Invalid UPACK_B64KEYPAIR", http.StatusInternalServerError)
			return
		}

		pubKey, err := sencode.ImportPublicKey(keys[0])
		if err != nil {
			http.Error(w, "Failed to import public key", http.StatusInternalServerError)
			return
		}

		encrypted, err := sencode.EncodeSEncode([]byte(resdata.IDToken), pubKey, 5)
		if err != nil {
			http.Error(w, "Failed to encode token", http.StatusInternalServerError)
			return
		}

		// レスポンス返却
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]any{
			"obfuscate": "upack.js",
			"token":     encrypted,
		})
		return
	}

	// ----------------------------------------------------
	// PUT リクエスト処理
	// ----------------------------------------------------
	if r.Method == http.MethodPut {
		bodyBytes, err := io.ReadAll(r.Body)
		if err != nil {
			http.Error(w, "Failed to read body", http.StatusBadRequest)
			return
		}

		// ヌル文字除去処理（22P05エラー防止）
		cleanedBody := strings.ReplaceAll(string(bodyBytes), "\u0000", "")

		updatePayload := map[string]any{
			"value":      cleanedBody,
			"updated_at": time.Now(),
		}
		payloadBytes, _ := json.Marshal(updatePayload)

		reqURL := fmt.Sprintf("%s/rest/v1/wiki_variables?id=eq.%s", supabaseURL, targetID)
		req, err := http.NewRequest("PATCH", reqURL, bytes.NewBuffer(payloadBytes))
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("apikey", serviceKey)
		req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", serviceKey))
		req.Header.Set("Prefer", "return=minimal")

		client := &http.Client{}
		resp, err := client.Do(req)
		if err != nil || resp.StatusCode < 200 || resp.StatusCode >= 300 {
			http.Error(w, "Supabase update failed", http.StatusInternalServerError)
			return
		}
		defer resp.Body.Close()

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]bool{"success": true})
		return
	}

	http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
}
