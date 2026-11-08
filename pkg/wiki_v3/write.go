package wiki_v3

import (
	"bytes"
	"compress/gzip"
	"database/sql"
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"github.com/google/uuid"
)

func HandleWrite(w http.ResponseWriter, r *http.Request, dbConn *sql.DB, wikiSlug, pageSlug, reqType string, isCli, apiKeyVerified bool, userId string, isAdmin bool, wiki map[string]any) {
	if reqType == "rtcomment" {
		var bodyData struct {
			Name string `json:"name"`
			Body string `json:"body"`
		}
		if err := json.NewDecoder(r.Body).Decode(&bodyData); err != nil {
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(map[string]string{"error": "Invalid request body"})
			return
		}
		err := InsertCommentToSupabase(bodyData.Name, bodyData.Body, wikiSlug, pageSlug, userId)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
			return
		}
		json.NewEncoder(w).Encode(map[string]any{"success": true})
		return
	}

	var reqBody struct {
		Content string `json:"content"`
		Title   string `json:"title"`
		Freeze  *bool  `json:"freeze"`
		Slug    string `json:"slug"`
	}
	if err := json.NewDecoder(r.Body).Decode(&reqBody); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Content is required"})
		return
	}

	if reqBody.Content == "" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Content is required"})
		return
	}

	nextFreeze := false
	if reqBody.Freeze != nil {
		nextFreeze = *reqBody.Freeze
	}

	targetSlug := pageSlug
	if r.Method == http.MethodPost && reqBody.Slug != "" {
		targetSlug = reqBody.Slug
	}

	var wasFrozenInt int
	err := dbConn.QueryRow("SELECT freeze FROM wiki_pages WHERE wiki_slug = ? AND slug = ?", wikiSlug, targetSlug).Scan(&wasFrozenInt)
	wasFrozen := (err == nil && wasFrozenInt != 0)

	if isCli && !apiKeyVerified {
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]string{"error": "Unauthorized"})
		return
	}

	ownerId := GetString(wiki["owner_id"])
	editMode := GetString(wiki["edit_mode"])
	cliFreezeEdit, _ := wiki["cli_freeze_edit"].(bool)
	cliUsed, _ := wiki["cli_used"].(bool)

	if userId != ownerId && !isAdmin {
		if !cliFreezeEdit && wasFrozen {
			w.WriteHeader(http.StatusForbidden)
			json.NewEncoder(w).Encode(map[string]string{"error": "This page is frozen."})
			return
		}
		if editMode == "private" && userId == "" {
			w.WriteHeader(http.StatusForbidden)
			json.NewEncoder(w).Encode(map[string]string{"error": "Edit Mode is Private. Access denied", "user_id": userId})
			return
		}
		if userId == "" && isCli {
			w.WriteHeader(http.StatusForbidden)
			json.NewEncoder(w).Encode(map[string]string{"error": "No CLI Authenticationed. Access denied"})
			return
		}
		if !cliUsed && isCli {
			w.WriteHeader(http.StatusForbidden)
			json.NewEncoder(w).Encode(map[string]string{"error": "Wiki Setting is cannot use CLI. Access denied"})
			return
		}
	}

	finalContent := strings.ReplaceAll(reqBody.Content, "&now;", FormatNow())

	var buf bytes.Buffer
	gz, _ := gzip.NewWriterLevel(&buf, 9)
	gz.Write([]byte(finalContent))
	gz.Close()
	compressed := buf.Bytes()

	updatedAt := time.Now().UTC().Format(time.RFC3339)
	pageId := uuid.New().String()

	var existingId string
	err = dbConn.QueryRow("SELECT id FROM wiki_pages WHERE wiki_slug = ? AND slug = ?", wikiSlug, targetSlug).Scan(&existingId)
	if err == nil {
		pageId = existingId
	}

	titleVal := reqBody.Title
	if titleVal == "" {
		titleVal = "Untitled"
	}

	_, err = dbConn.Exec(`
		INSERT OR REPLACE INTO wiki_pages (id, slug, wiki_slug, title, content, updated_at, author_id, freeze) 
		VALUES (?, ?, ?, ?, ?, ?, ?, ?)
	`, pageId, targetSlug, wikiSlug, titleVal, compressed, updatedAt, userId, nextFreeze)

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Database update failed"})
		return
	}

	go UpdateWikiTimestamp(wikiSlug, pageSlug)

	json.NewEncoder(w).Encode(map[string]interface{}{"success": true, "cli": isCli})
}
