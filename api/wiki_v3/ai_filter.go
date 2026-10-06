package handler

import (
	"encoding/json"
	"net/http"
	"os"
	"strings"

	"asakura-wiki.vercel.app/pkg/wiki_v3"
)

type FilterRequest struct {
	UserID  string `json:"user_id"`
	IsDebug bool   `json:"is_debug"`
	Content string `json:"content"`
}

type FilterResponse struct {
	FilteredContent string `json:"filtered_content"`
}

func Handler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req FilterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	supabaseURL := strings.TrimSpace(os.Getenv("NEXT_PUBLIC_SUPABASE_URL"))
	anonKey := strings.TrimSpace(os.Getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY"))

	// リクエストコンテキストを引き継ぐ
	filtered := wiki_v3.AIFilter(r.Context(), req.UserID, req.IsDebug, req.Content, supabaseURL, anonKey, nil)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(FilterResponse{
		FilteredContent: filtered,
	})
}
