package handler

import (
	"encoding/json"
	"log"
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
		log.Printf("[Handler] Error decoding request body: %v\n", err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	log.Printf("[Handler] Request received for UserID: %s (IsDebug: %t, Content Length: %d)\n", req.UserID, req.IsDebug, len(req.Content))

	supabaseURL := strings.TrimSpace(os.Getenv("NEXT_PUBLIC_SUPABASE_URL"))
	anonKey := strings.TrimSpace(os.Getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY"))

	if supabaseURL == "" || anonKey == "" {
		log.Println("[Handler] WARNING: Supabase environment variables might be missing.")
	}

	// リクエストコンテキストを引き継ぐ
	filtered := wiki_v3.AIFilter(r.Context(), req.UserID, req.IsDebug, req.Content, supabaseURL, anonKey, nil)

	log.Printf("[Handler] Returning response (Filtered Content Length: %d)\n", len(filtered))

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(FilterResponse{
		FilteredContent: filtered,
	})
}
