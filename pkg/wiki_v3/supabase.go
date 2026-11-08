package wiki_v3

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strings"
	"time"
)

func getSupabaseKey() string {
	key := os.Getenv("SUPABASE_SERVICE_ROLE_KEY")
	if key == "" {
		key = os.Getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
	}
	return key
}

func FetchWikiFromSupabase(slug string) (map[string]interface{}, error) {
	supabaseURL := strings.TrimSpace(os.Getenv("NEXT_PUBLIC_SUPABASE_URL"))
	supabaseKey := strings.TrimSpace(getSupabaseKey())

	if supabaseURL == "" {
		return nil, fmt.Errorf("NEXT_PUBLIC_SUPABASE_URL is not set")
	}

	apiURL := fmt.Sprintf("%s/rest/v1/wikis?slug=eq.%s&select=*", supabaseURL, slug)

	log.Printf("[Supabase] Fetching Wiki URL: %s", apiURL)

	req, err := http.NewRequest("GET", apiURL, nil)
	if err != nil {
		return nil, err
	}

	req.Header.Set("apikey", supabaseKey)
	req.Header.Set("Authorization", "Bearer "+supabaseKey)

	client := &http.Client{Timeout: 5 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		log.Printf("[Supabase] HTTP Request Error: %v", err)
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		bodyBytes, _ := io.ReadAll(resp.Body)
		log.Printf("[Supabase] Error Response (Status %d): %s", resp.StatusCode, string(bodyBytes))
		return nil, fmt.Errorf("supabase returned status: %d, body: %s", resp.StatusCode, string(bodyBytes))
	}

	var results []map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&results); err != nil {
		log.Printf("[Supabase] JSON Decode Error: %v", err)
		return nil, err
	}

	if len(results) == 0 {
		log.Printf("[Supabase] Wiki not found for slug: %s", slug)
		return nil, nil
	}

	return results[0], nil
}

func VerifySupabaseToken(token string) string {
	if token == "" {
		log.Println("[Auth] Token is empty in request header")
		return ""
	}

	supabaseURL := strings.TrimSpace(os.Getenv("NEXT_PUBLIC_SUPABASE_URL"))
	supabaseKey := strings.TrimSpace(os.Getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY"))

	if supabaseURL == "" {
		log.Println("[Auth] NEXT_PUBLIC_SUPABASE_URL is not set")
		return ""
	}

	apiURL := supabaseURL + "/auth/v1/user"
	req, err := http.NewRequest("GET", apiURL, nil)
	if err != nil {
		log.Printf("[Auth] NewRequest error: %v", err)
		return ""
	}

	req.Header.Set("apikey", supabaseKey)
	req.Header.Set("Authorization", "Bearer "+token)

	client := &http.Client{Timeout: 3 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		log.Printf("[Auth] HTTP client.Do error: %v", err)
		return ""
	}
	defer resp.Body.Close()

	bodyBytes, _ := io.ReadAll(resp.Body)
	log.Printf("[Auth] Supabase /auth/v1/user Status: %d, Body: %s", resp.StatusCode, string(bodyBytes))

	if resp.StatusCode != http.StatusOK {
		return ""
	}

	var userResp struct {
		ID string `json:"id"`
	}
	if err := json.Unmarshal(bodyBytes, &userResp); err != nil {
		log.Printf("[Auth] JSON Decode error: %v", err)
		return ""
	}

	log.Printf("[Auth] Successfully verified userId: %s", userResp.ID)
	return userResp.ID
}

func InsertCommentToSupabase(name, body, wikiSlug, pageSlug, userId string) error {
	supabaseURL := os.Getenv("NEXT_PUBLIC_SUPABASE_URL")
	supabaseKey := getSupabaseKey()

	apiURL := supabaseURL + "/rest/v1/comments"

	payload := map[string]any{
		"name":      name,
		"body":      body,
		"wiki_slug": wikiSlug,
		"page_slug": pageSlug,
		"user_id":   userId,
	}
	jsonBytes, _ := json.Marshal(payload)

	req, err := http.NewRequest("POST", apiURL, bytes.NewBuffer(jsonBytes))
	if err != nil {
		return err
	}

	req.Header.Set("apikey", supabaseKey)
	req.Header.Set("Authorization", "Bearer "+supabaseKey)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Prefer", "return=minimal")

	client := &http.Client{Timeout: 5 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		bodyBytes, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("failed to insert comment: %s", string(bodyBytes))
	}

	return nil
}

func DeleteWikiFromSupabase(wikiSlug string) error {
	supabaseURL := strings.TrimSpace(os.Getenv("NEXT_PUBLIC_SUPABASE_URL"))
	supabaseKey := strings.TrimSpace(getSupabaseKey())

	if supabaseURL == "" {
		return fmt.Errorf("NEXT_PUBLIC_SUPABASE_URL is not set")
	}

	apiURL := fmt.Sprintf("%s/rest/v1/wikis?slug=eq.%s", supabaseURL, wikiSlug)

	req, err := http.NewRequest("DELETE", apiURL, nil)
	if err != nil {
		return err
	}

	req.Header.Set("apikey", supabaseKey)
	req.Header.Set("Authorization", "Bearer "+supabaseKey)
	req.Header.Set("Prefer", "return=minimal")

	client := &http.Client{Timeout: 5 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		bodyBytes, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("failed to delete wiki from supabase: %s", string(bodyBytes))
	}

	return nil
}

func UpdateWikiTimestamp(wikiSlug, pageSlug string) {
	supabaseURL := os.Getenv("NEXT_PUBLIC_SUPABASE_URL")
	supabaseKey := getSupabaseKey()

	apiURL := fmt.Sprintf("%s/rest/v1/wikis?slug=eq.%s", supabaseURL, slugOrAlias(wikiSlug))

	payload := map[string]any{
		"updated_at":   time.Now().UTC().Format(time.RFC3339),
		"updated_page": pageSlug,
	}
	jsonBytes, _ := json.Marshal(payload)

	req, err := http.NewRequest("PATCH", apiURL, bytes.NewBuffer(jsonBytes))
	if err != nil {
		return
	}

	req.Header.Set("apikey", supabaseKey)
	req.Header.Set("Authorization", "Bearer "+supabaseKey)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Prefer", "return=minimal")

	client := &http.Client{Timeout: 5 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return
	}
	defer resp.Body.Close()
}

// 補助関数
func slugOrAlias(s string) string {
	return s
}
