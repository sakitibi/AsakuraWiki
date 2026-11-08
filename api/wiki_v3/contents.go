package handler

import (
	"bytes"
	"compress/gzip"
	"database/sql"
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"asakura-wiki.vercel.app/pkg/wiki_v3"
	"github.com/google/uuid"
)

func WikiHandler(w http.ResponseWriter, r *http.Request) {
	// CORSヘッダー設定
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, x-apikey, x-cli, x-type")

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	w.Header().Set("Content-Type", "application/json")

	dbConn, err := wiki_v3.GetDB()
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Database connection failed"})
		return
	}

	query := r.URL.Query()
	wikiSlug := query.Get("wiki_slug")
	pageSlug := query.Get("page_slug")

	if wikiSlug == "" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "wiki_slug parameter is required"})
		return
	}

	isRootWikiRequest := false
	if pageSlug == "" {
		pageSlug = "FrontPage"
		isRootWikiRequest = true
	}

	// ======================
	// GET: 読み取り
	// ======================
	if r.Method == http.MethodGet {
		if isRootWikiRequest {
			wiki, err := wiki_v3.FetchWikiFromSupabase(wikiSlug)
			if err != nil || wiki == nil {
				w.WriteHeader(http.StatusNotFound)
				json.NewEncoder(w).Encode(map[string]string{"error": "Wiki not found"})
				return
			}

			rows, err := dbConn.Query("SELECT slug FROM wiki_pages WHERE wiki_slug = ?", wikiSlug)
			if err != nil {
				w.WriteHeader(http.StatusInternalServerError)
				json.NewEncoder(w).Encode(map[string]string{"error": "Database error"})
				return
			}
			defer rows.Close()

			var pageSlugs []string
			for rows.Next() {
				var s string
				if err := rows.Scan(&s); err == nil {
					pageSlugs = append(pageSlugs, s)
				}
			}

			resData := map[string]interface{}{
				"wiki_slug":  wikiSlug,
				"title":      wiki["name"],
				"page_slugs": pageSlugs,
				"cli_used":   wiki["cli_used"],
			}
			json.NewEncoder(w).Encode(resData)
			return
		}

		// 個別ページの取得
		row := dbConn.QueryRow("SELECT id, title, content, updated_at, author_id, freeze FROM wiki_pages WHERE wiki_slug = ? AND slug = ?", wikiSlug, pageSlug)
		var id, title, updatedAt, authorId string
		var content []byte
		var freezeInt int

		if err := row.Scan(&id, &title, &content, &updatedAt, &authorId, &freezeInt); err != nil {
			if err == sql.ErrNoRows {
				w.WriteHeader(http.StatusNotFound)
				json.NewEncoder(w).Encode(map[string]string{"error": "Page not found"})
				return
			}
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{"error": "Database error"})
			return
		}

		resData := map[string]interface{}{
			"page_id":    id,
			"title":      title,
			"content":    wiki_v3.ToBase64(content),
			"updated_at": updatedAt,
			"author_id":  authorId,
			"freeze":     freezeInt != 0,
		}
		json.NewEncoder(w).Encode(resData)
		return
	}

	isCli := r.Header.Get("x-cli") == "true"
	reqType := r.Header.Get("x-type")
	authHeader := r.Header.Get("Authorization")
	var token string
	if t, found := strings.CutPrefix(authHeader, "Bearer "); found {
		token = t
	}

	apiKey := wiki_v3.DecodeLatin1ToUtf8(r.Header.Get("x-apikey"))

	wiki, err := wiki_v3.FetchWikiFromSupabase(wikiSlug)
	if err != nil || wiki == nil {
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]string{"error": "Wiki not found"})
		return
	}

	userId := wiki_v3.VerifySupabaseToken(token)
	isAdmin := wiki_v3.IsAdminUser(userId)
	cliTokenStr, _ := wiki["cli_token"].(string)
	apiKeyVerified := (apiKey == cliTokenStr)

	// ======================
	// PUT / POST: 保存
	// ======================
	if r.Method == http.MethodPut || r.Method == http.MethodPost {
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
			err := wiki_v3.InsertCommentToSupabase(bodyData.Name, bodyData.Body, wikiSlug, pageSlug, userId)
			if err != nil {
				w.WriteHeader(http.StatusInternalServerError)
				json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
				return
			}
			json.NewEncoder(w).Encode(map[string]interface{}{"success": true})
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
		err = dbConn.QueryRow("SELECT freeze FROM wiki_pages WHERE wiki_slug = ? AND slug = ?", wikiSlug, targetSlug).Scan(&wasFrozenInt)
		wasFrozen := (err == nil && wasFrozenInt != 0)

		if isCli && !apiKeyVerified {
			w.WriteHeader(http.StatusUnauthorized)
			json.NewEncoder(w).Encode(map[string]string{"error": "Unauthorized"})
			return
		}

		ownerId := wiki_v3.GetString(wiki["owner_id"])
		editMode := wiki_v3.GetString(wiki["edit_mode"])
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
				json.NewEncoder(w).Encode(map[string]string{"error": "Access denied"})
				return
			}
			if userId == "" && isCli {
				w.WriteHeader(http.StatusForbidden)
				json.NewEncoder(w).Encode(map[string]string{"error": "Access denied"})
				return
			}
			if !cliUsed && isCli {
				w.WriteHeader(http.StatusForbidden)
				json.NewEncoder(w).Encode(map[string]string{"error": "Access denied"})
				return
			}
		}

		finalContent := strings.ReplaceAll(reqBody.Content, "&now;", wiki_v3.FormatNow())

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

		go wiki_v3.UpdateWikiTimestamp(wikiSlug, pageSlug)

		json.NewEncoder(w).Encode(map[string]interface{}{"success": true, "cli": isCli})
		return
	}

	if r.Method == http.MethodDelete {
		if pageSlug == "FrontPage" {
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(map[string]string{"error": "Cannot delete FrontPage"})
			return
		}

		var isFrozenInt int
		err = dbConn.QueryRow("SELECT freeze FROM wiki_pages WHERE wiki_slug = ? AND slug = ?", wikiSlug, pageSlug).Scan(&isFrozenInt)
		isFrozen := (err == nil && isFrozenInt != 0)

		if isCli && !apiKeyVerified {
			w.WriteHeader(http.StatusUnauthorized)
			json.NewEncoder(w).Encode(map[string]string{"error": "Unauthorized"})
			return
		}

		ownerId := wiki_v3.GetString(wiki["owner_id"])
		editMode := wiki_v3.GetString(wiki["edit_mode"])
		cliFreezeEdit, _ := wiki["cli_freeze_edit"].(bool)
		cliUsed, _ := wiki["cli_used"].(bool)

		if !cliFreezeEdit && isFrozen {
			w.WriteHeader(http.StatusForbidden)
			json.NewEncoder(w).Encode(map[string]string{"error": "This page is frozen."})
			return
		}
		if editMode == "private" && userId == "" {
			w.WriteHeader(http.StatusForbidden)
			json.NewEncoder(w).Encode(map[string]string{"error": "Access denied"})
			return
		}
		if userId == "" && isCli {
			w.WriteHeader(http.StatusForbidden)
			json.NewEncoder(w).Encode(map[string]string{"error": "Access denied"})
			return
		}
		if !cliUsed && isCli && userId != ownerId {
			w.WriteHeader(http.StatusForbidden)
			json.NewEncoder(w).Encode(map[string]string{"error": "Access denied"})
			return
		}

		_, err = dbConn.Exec("DELETE FROM wiki_pages WHERE wiki_slug = ? AND slug = ?", wikiSlug, pageSlug)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{"error": "Failed to delete page"})
			return
		}

		go wiki_v3.UpdateWikiTimestamp(wikiSlug, pageSlug)

		json.NewEncoder(w).Encode(map[string]interface{}{"success": true})
		return
	}

	w.WriteHeader(http.StatusMethodNotAllowed)
}
