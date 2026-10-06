package handler

import (
	"encoding/json"
	"net/http"

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

	// リクエストコンテキストを引き継ぐ（クライアントが切断した場合にAPI通信もキャンセルされます）
	filtered := wiki_v3.AIFilter(r.Context(), req.UserID, req.IsDebug, req.Content, nil)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(FilterResponse{
		FilteredContent: filtered,
	})
}
