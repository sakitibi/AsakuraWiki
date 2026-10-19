package handler

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"asakura-wiki.vercel.app/pkg"
	"asakura-wiki.vercel.app/pkg/amongus/token"
	"github.com/sakitibi/upack.go/sencode"
)

func TokenHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, PUT, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

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

		data, errResp := token.FetchWikiVariable(supabaseURL, anonKey, targetID)
		if errResp != nil {
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(errResp)
			return
		}

		idToken, errResp := token.FetchEpicToken(data.Value)
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

		encrypted, err := sencode.EncodeSEncode([]byte(idToken), pubKey, 20)
		if err != nil {
			http.Error(w, "Failed to encode token", http.StatusInternalServerError)
			return
		}

		var resToken string

		if isAdmin {
			resToken = idToken
		} else {
			resToken = encrypted
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]any{
			"obfuscate": "upack.js",
			"token":     resToken,
		})
		return
	}

	// ----------------------------------------------------
	// PUT リクエスト処理
	// ----------------------------------------------------
	if r.Method == http.MethodPut {
		errResp := token.UpdateWikiVariable(r.Body, supabaseURL, anonKey, targetID)
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
