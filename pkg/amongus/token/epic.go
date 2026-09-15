package token

import (
	"crypto/rand"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"strings"

	"github.com/andybalholm/brotli"
)

type EpicTokenResponse struct {
	IDToken string `json:"id_token"`
}

func FetchEpicToken(externalToken string) (string, map[string]any) {
	formData := url.Values{}
	formData.Set("grant_type", "external_auth")
	formData.Set("external_auth_type", "apple_id_token")
	formData.Set("external_auth_token", externalToken)
	formData.Set("deployment_id", "503cd077a7804777aee5a6eeb5cfe62d")
	formData.Set("nonce", generateRandomString(22))
	formData.Set("display_name", "14人TVバン70回")

	epicReq, err := http.NewRequest("POST", "https://api.epicgames.dev/auth/v1/oauth/token", strings.NewReader(formData.Encode()))
	if err != nil {
		return "", map[string]any{"error": err.Error()}
	}

	epicReq.Header.Set("Connection", "keep-alive")
	epicReq.Header.Set("User-Agent", "EOS-SDK/1.19.0.3-49960398 (IOS/26.5) AmongUs/1.0")
	epicReq.Header.Set("X-EOS-Version", "1.19.0.3-49960398")
	epicReq.Header.Set("X-Epic-Correlation-ID", "EOS-j1paBsBeRC6OSGsH0uOGOQ-9n1cSWXfQ_-jpuL2BMBJcg")
	epicReq.Header.Set("Host", "api.epicgames.dev")
	epicReq.Header.Set("Accept", "application/json")
	epicReq.Header.Set("Authorization", fmt.Sprintf("Basic %s", strings.TrimSpace(os.Getenv("AMONG_EPICAPIKEY"))))
	epicReq.Header.Set("Accept-Language", "ja")
	epicReq.Header.Set("Accept-Encoding", "br")
	epicReq.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	client := &http.Client{}
	epicResp, err := client.Do(epicReq)
	if err != nil || epicResp.StatusCode != http.StatusOK {
		var details string
		if epicResp != nil {
			b, _ := io.ReadAll(epicResp.Body)
			details = string(b)
			defer epicResp.Body.Close()
		}
		return "", map[string]any{
			"error":   "oauth_token failed.",
			"details": details,
		}
	}
	defer epicResp.Body.Close()

	var reader io.Reader = epicResp.Body

	if epicResp.Header.Get("Content-Encoding") == "br" {
		reader = brotli.NewReader(epicResp.Body)
	}

	var resdata EpicTokenResponse
	if err := json.NewDecoder(reader).Decode(&resdata); err != nil {
		return "", map[string]any{"error": "Invalid epic response"}
	}

	return resdata.IDToken, nil
}

func generateRandomString(length int) string {
	const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_"
	b := make([]byte, length)
	if _, err := rand.Read(b); err != nil {
		return ""
	}
	for i, v := range b {
		b[i] = chars[v%byte(len(chars))]
	}
	return string(b)
}
