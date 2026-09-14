package token

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"
)

type WikiVariable struct {
	Value     string    `json:"value"`
	UpdatedAt time.Time `json:"updated_at"`
}

func FetchWikiVariable(supabaseURL, anonKey, targetID string) (*WikiVariable, map[string]any) {
	reqURL := fmt.Sprintf("%s/rest/v1/wiki_variables?id=eq.%s&select=value,updated_at", supabaseURL, targetID)
	req, err := http.NewRequest("GET", reqURL, nil)
	if err != nil {
		return nil, map[string]any{"error": err.Error()}
	}

	req.Header.Set("apikey", anonKey)
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", anonKey))

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, map[string]any{"error": fmt.Sprintf("Supabase request failed: %v", err)}
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		bodyBytes, _ := io.ReadAll(resp.Body)
		return nil, map[string]any{
			"error":   "Failed to fetch from supabase",
			"status":  resp.StatusCode,
			"details": string(bodyBytes),
		}
	}

	var vars []WikiVariable
	if err := json.NewDecoder(resp.Body).Decode(&vars); err != nil || len(vars) == 0 {
		return nil, map[string]any{"error": "Data not found or decode error"}
	}

	return &vars[0], nil
}

func UpdateWikiVariable(body io.Reader, supabaseURL, anonKey, targetID string) map[string]any {
	bodyBytes, err := io.ReadAll(body)
	if err != nil {
		return map[string]any{"error": "Failed to read body"}
	}

	cleanedBody := strings.ReplaceAll(string(bodyBytes), "\u0000", "")

	updatePayload := map[string]any{
		"value":      cleanedBody,
		"updated_at": time.Now(),
	}
	payloadBytes, _ := json.Marshal(updatePayload)

	reqURL := fmt.Sprintf("%s/rest/v1/wiki_variables?id=eq.%s", supabaseURL, targetID)
	req, err := http.NewRequest("PATCH", reqURL, bytes.NewBuffer(payloadBytes))
	if err != nil {
		return map[string]any{"error": err.Error()}
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("apikey", anonKey)
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", anonKey))
	req.Header.Set("Prefer", "return=minimal")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil || resp.StatusCode < 200 || resp.StatusCode >= 300 {
		var details string
		if resp != nil {
			b, _ := io.ReadAll(resp.Body)
			details = string(b)
			defer resp.Body.Close()
		}
		return map[string]any{
			"error":   "Supabase update failed",
			"details": details,
		}
	}
	defer resp.Body.Close()

	return nil
}
