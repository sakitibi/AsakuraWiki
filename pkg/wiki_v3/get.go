package wiki_v3

import (
	"database/sql"
	"encoding/json"
	"net/http"
)

func HandleGet(w http.ResponseWriter, r *http.Request, dbConn *sql.DB, wikiSlug, pageSlug string, hasPageSlug bool) {
	if !hasPageSlug {
		wiki, err := FetchWikiFromSupabase(wikiSlug)
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

		resData := map[string]any{
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

	resData := map[string]any{
		"page_id":    id,
		"title":      title,
		"content":    ToBase64(content),
		"updated_at": updatedAt,
		"author_id":  authorId,
		"freeze":     freezeInt != 0,
	}
	json.NewEncoder(w).Encode(resData)
}
