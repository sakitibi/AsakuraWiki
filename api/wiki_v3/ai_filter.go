package handler

import (
	"encoding/json"
	"fmt"
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

type StreamChunkResponse struct {
	Chunk string `json:"chunk"`
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

	log.Printf("[Handler] Streaming Request received for UserID: %s (IsDebug: %t, Content Length: %d)\n", req.UserID, req.IsDebug, len(req.Content))

	supabaseURL := strings.TrimSpace(os.Getenv("NEXT_PUBLIC_SUPABASE_URL"))
	anonKey := strings.TrimSpace(os.Getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY"))

	if supabaseURL == "" || anonKey == "" {
		log.Println("[Handler] WARNING: Supabase environment variables might be missing.")
	}

	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")

	flusher, ok := w.(http.Flusher)
	if !ok {
		http.Error(w, "Streaming unsupported!", http.StatusInternalServerError)
		return
	}

	_ = wiki_v3.AIFilter(r.Context(), req.UserID, req.IsDebug, req.Content, supabaseURL, anonKey, nil, func(chunk string) {
		chunkResp := StreamChunkResponse{Chunk: chunk}
		dataBytes, err := json.Marshal(chunkResp)
		if err == nil {
			fmt.Fprintf(w, "data: %s\n\n", string(dataBytes))
			flusher.Flush()
		}
	})

	// 終了シグナルを送信
	fmt.Fprintf(w, "data: [DONE]\n\n")
	flusher.Flush()

	log.Println("[Handler] Streaming response completed.")
}
