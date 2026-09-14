package pkg

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strings"
)

// 関数名を大文字 (GetSupabaseUser) に変更してエクスポート
func GetSupabaseUser(authHeader string) (*SupabaseUserResponse, error) {
	supabaseURL := strings.TrimSpace(os.Getenv("NEXT_PUBLIC_SUPABASE_URL"))
	supabaseAnonKey := strings.TrimSpace(os.Getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY"))

	if supabaseURL == "" || supabaseAnonKey == "" || authHeader == "" {
		return nil, nil
	}

	token := strings.TrimSpace(authHeader)
	if strings.HasPrefix(strings.ToLower(token), "bearer ") {
		token = strings.TrimSpace(token[7:])
	}

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
