package handler

import (
	"encoding/json"
	"net/http"
	"strings"

	"asakura-wiki.vercel.app/pkg/wiki_v3"
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
	rawPageSlug := query.Get("page_slug")

	println("DEBUG REQUEST -> Path:", r.URL.Path, "wiki_slug:", wikiSlug, "page_slug:", rawPageSlug)

	if wikiSlug == "" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "wiki_slug parameter is required"})
		return
	}

	hasPageSlug := (rawPageSlug != "")
	pageSlug := rawPageSlug
	if !hasPageSlug {
		pageSlug = "FrontPage"
	}

	if r.Method == http.MethodGet {
		wiki_v3.HandleGet(w, r, dbConn, wikiSlug, pageSlug, hasPageSlug)
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

	switch r.Method {
	case http.MethodPost, http.MethodPut:
		wiki_v3.HandleWrite(w, r, dbConn, wikiSlug, pageSlug, reqType, isCli, apiKeyVerified, userId, isAdmin, wiki)
	case http.MethodDelete:
		wiki_v3.HandleDelete(w, r, dbConn, wikiSlug, pageSlug, hasPageSlug, isCli, apiKeyVerified, userId, isAdmin, wiki)
	default:
		w.WriteHeader(http.StatusMethodNotAllowed)
	}
}
