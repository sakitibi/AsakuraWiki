package handler

import (
	"encoding/json"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/sakitibi/upack.go/sencode"
	"asakura-wiki.vercel.app/pkg/amongus/token"
)

func TokenHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, PUT, OPTIONS")

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	supabaseURL := strings.TrimSpace(os.Getenv("NEXT_PUBLIC_SUPABASE_URL"))
	anonKey := strings.TrimSpace(os.Getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY"))
	targetID := "a7869bcb-1c09-b4b2-4939-d382a5f27247"

	// ----------------------------------------------------
	// GET リクエスト処理
	// ----------------------------------------------------
	if r.Method == http.MethodGet {
		data, errResp := FetchWikiVariable(supabaseURL, anonKey, targetID)
		if errResp != nil {
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(errResp)
			return
		}

		idToken, errResp := FetchEpicToken(data.Value)
		if errResp != nil {
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(errResp)
			return
		}

		if data.Value == "" {
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]any{
				"error":   "token is null",
				"reason":  "value is empty",
				"updated": data.UpdatedAt,
			})
			return
		}

		if isOneDayEarlier(data.UpdatedAt) {
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]any{
				"error":   "token is null",
				"reason":  "data is older than 24 hours",
				"updated": data.UpdatedAt,
				"now":     time.Now(),
			})
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

		encrypted, err := sencode.EncodeSEncode([]byte(idToken), pubKey, 5)
		if err != nil {
			http.Error(w, "Failed to encode token", http.StatusInternalServerError)
			return
		}

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
		errResp := UpdateWikiVariable(r.Body, supabaseURL, anonKey, targetID)
		if errResp != nil {
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(errResp)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]bool{"success": true})
		return
	}

	http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
}

func isOneDayEarlier(referenceDate time.Time) bool {
	return time.Since(referenceDate) >= 24*time.Hour
}
