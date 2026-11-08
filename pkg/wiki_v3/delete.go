package wiki_v3

import (
	"database/sql"
	"encoding/json"
	"net/http"
)

func HandleDelete(w http.ResponseWriter, r *http.Request, dbConn *sql.DB, wikiSlug, pageSlug string, hasPageSlug bool, isCli, apiKeyVerified bool, userId string, isAdmin bool, wiki map[string]any) {
	ownerId := GetString(wiki["owner_id"])

	// オーナーまたは管理者以外は削除不可
	if userId != ownerId && !isAdmin {
		w.WriteHeader(http.StatusForbidden)
		json.NewEncoder(w).Encode(map[string]string{"error": "Access denied"})
		return
	}

	// page_slug が未指定の場合は Wiki ごと削除
	if !hasPageSlug {
		_, err := dbConn.Exec("DELETE FROM wiki_pages WHERE wiki_slug = ?", wikiSlug)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{"error": "Failed to delete wiki pages from DB"})
			return
		}

		err = DeleteWikiFromSupabase(wikiSlug)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{"error": "Failed to delete wiki from Supabase"})
			return
		}

		json.NewEncoder(w).Encode(map[string]any{"success": true, "deleted": "wiki"})
		return
	}

	// 個別ページの削除
	if pageSlug == "FrontPage" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Cannot delete FrontPage"})
		return
	}

	var isFrozenInt int
	err := dbConn.QueryRow("SELECT freeze FROM wiki_pages WHERE wiki_slug = ? AND slug = ?", wikiSlug, pageSlug).Scan(&isFrozenInt)
	isFrozen := (err == nil && isFrozenInt != 0)

	if isCli && !apiKeyVerified {
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]string{"error": "Unauthorized"})
		return
	}

	cliFreezeEdit, _ := wiki["cli_freeze_edit"].(bool)
	cliUsed, _ := wiki["cli_used"].(bool)

	if !cliFreezeEdit && isFrozen {
		w.WriteHeader(http.StatusForbidden)
		json.NewEncoder(w).Encode(map[string]string{"error": "This page is frozen."})
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

	go UpdateWikiTimestamp(wikiSlug, pageSlug)

	json.NewEncoder(w).Encode(map[string]any{"success": true})
}
