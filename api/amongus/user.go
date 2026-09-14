package handler

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"

	"asakura-wiki.vercel.app/pkg"
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

	pubKey, err := pkg.ImportPublicKey(keys[0])
	if err != nil {
		http.Error(w, fmt.Sprintf("Public key import error: %v", err), http.StatusInternalServerError)
		return
	}

	privKey, err := pkg.ImportPrivateKey(keys[1])
	if err != nil {
		http.Error(w, fmt.Sprintf("Private key import error: %v", err), http.StatusInternalServerError)
		return
	}

	// トークンの取得
	apiBaseURL := os.Getenv("NEXT_PUBLIC_API_BASE_URL")
	resp1, err := http.Get(fmt.Sprintf("%s/api/amongus/token", apiBaseURL))
	if err != nil || resp1.StatusCode != http.StatusOK {
		var errData string
		if resp1 != nil {
			b, _ := io.ReadAll(resp1.Body)
			errData = string(b)
			resp1.Body.Close()
		}
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "token error", "data": errData})
		return
	}

	var tokenRes TokenResponse
	json.NewDecoder(resp1.Body).Decode(&tokenRes)
	resp1.Body.Close()

	// upackによるトークンの解読
	decodedResult, err := sencode.DecodeSEncode(tokenRes.Token, privKey, true, 5)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "failed to decode token"})
		return
	}

	authToken, ok := decodedResult.(string)
	if !ok {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "invalid decoded token type"})
		return
	}

	// Among Us API 呼び出し
	data2, statusCode, err := amongus.FetchAmongUsUser(authToken)
	if err != nil || statusCode != http.StatusOK {
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]string{
			"error":      data2,
			"auth_token": authToken,
		})
		return
	}

	// upackによるレスポンスデータの難読化
	authTokenWithLobby, err := sencode.EncodeSEncode([]byte(data2), pubKey, 5)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "failed to encode response token"})
		return
	}

	// Supabase の DB 更新
	if err := amongus.UpdateWikiVariable(data2); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(
			map[string]any{
				"error": err.Error(),
			},
		)
		return
	}

	// レスポンス返却
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{
		"obfuscate": "upack.js",
		"token":     authTokenWithLobby,
	})
}
