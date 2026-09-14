package handler

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strings"

	"asakura-wiki.vercel.app/pkg/amongus"
	"github.com/sakitibi/upack.go/sencode"
)

type TokenResponse struct {
	Token string `json:"token"`
}

func Handler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")

	// 環境変数からの鍵読み込み
	keyPairEnv := os.Getenv("NEXT_PUBLIC_UPACK_B64KEYPAIR")
	keys := strings.Split(keyPairEnv, ",")
	if len(keys) < 2 {
		http.Error(w, "Invalid UPACK_B64KEYPAIR configuration", http.StatusInternalServerError)
		return
	}

	pubKey, err := sencode.ImportPublicKey(keys[0])
	if err != nil {
		http.Error(w, fmt.Sprintf("Public key import error: %v", err), http.StatusInternalServerError)
		return
	}

	privKey, err := sencode.ImportPrivateKey(keys[1])
	if err != nil {
		http.Error(w, fmt.Sprintf("Private key import error: %v", err), http.StatusInternalServerError)
		return
	}

	// トークンの取得
	apiBaseURL := os.Getenv("NEXT_PUBLIC_API_BASE_URL")
	resp1, err := http.Get(fmt.Sprintf("%s/api/amongus/token", apiBaseURL))
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]any{"error": "failed to request token", "details": err.Error()})
		return
	}
	defer resp1.Body.Close()

	if resp1.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp1.Body)
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]any{"error": "token error", "data": string(body)})
		return
	}

	var tokenRes TokenResponse
	if err := json.NewDecoder(resp1.Body).Decode(&tokenRes); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]any{"error": "invalid token response json"})
		return
	}

	// upackによるトークンの解読
	decodedResult, err := sencode.DecodeSEncode(tokenRes.Token, privKey, true, 5)
	if err != nil {
		log.Printf("[DEBUG] DecodeSEncode error: %v", err)
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]any{"error": "failed to decode token"})
		return
	}

	log.Printf("[DEBUG] Raw token received: %s", tokenRes.Token)
	log.Printf("[DEBUG] Decoded result type: %T, value: %v", decodedResult, decodedResult)

	var authToken string
	switch v := decodedResult.(type) {
	case string:
		authToken = v
	case []byte:
		log.Printf("[DEBUG] Decoded as []byte (length: %d): %s", len(v), string(v))
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]any{
			"error": "failed to decode token (signature mismatch or invalid format)",
		})
		return
	default:
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]any{"error": "invalid token type"})
		return
	}

	// Among Us API 呼び出し
	data2, statusCode, err := amongus.FetchAmongUsUser(authToken)
	if err != nil || statusCode != http.StatusOK {
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]any{
			"error":      data2,
			"auth_token": authToken,
		})
		return
	}

	// upackによるレスポンスデータの難読化
	authTokenWithLobby, err := sencode.EncodeSEncode([]byte(data2), pubKey, 5)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]any{"error": "failed to encode response token"})
		return
	}

	// Supabase の DB 更新
	if err := amongus.UpdateWikiVariable(data2); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]any{"error": err.Error()})
		return
	}

	// レスポンス返却
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]any{
		"obfuscate": "upack.js",
		"token":     authTokenWithLobby,
	})
}
