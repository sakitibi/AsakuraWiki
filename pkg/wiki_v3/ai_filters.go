package wiki_v3

import (
	"bufio"
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"

	"asakura-wiki.vercel.app/pkg"
	"asakura-wiki.vercel.app/pkg/amongus/token"
)

type CopilotTokenResponse struct {
	Token     string `json:"token"`
	ExpiresAt int64  `json:"expires_at"`
}

type ChatMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type ChatRequest struct {
	Messages    []ChatMessage `json:"messages"`
	Model       string        `json:"model"`
	Temperature float64       `json:"temperature"`
	Stream      bool          `json:"stream"`
	Intent      bool          `json:"intent"`
	MaxTokens   int           `json:"max_tokens,omitempty"`
}

type StreamDelta struct {
	Content string `json:"content"`
}

type StreamChoice struct {
	Delta StreamDelta `json:"delta"`
}

type StreamResponse struct {
	Choices []StreamChoice `json:"choices"`
}

// 401 Unauthorized 判定用カスタムエラー
type ErrUnauthorized struct {
	StatusCode int
}

func (e *ErrUnauthorized) Error() string {
	return fmt.Sprintf("copilot api unauthorized error: status %d", e.StatusCode)
}

func fetchCopilotSessionToken(ctx context.Context) (string, error) {
	log.Println("[AIFilter] Fetching new Copilot session token from GitHub API...")
	req, err := http.NewRequestWithContext(ctx, "GET", "https://api.github.com/copilot_internal/v2/token", nil)
	if err != nil {
		log.Printf("[AIFilter] Error creating request for session token: %v\n", err)
		return "", err
	}

	githubToken := os.Getenv("GITHUB_COPILOT_TOKEN")
	if githubToken == "" {
		log.Println("[AIFilter] WARNING: GITHUB_COPILOT_TOKEN environment variable is empty!")
	}

	req.Header.Set("Authorization", "token "+githubToken)
	req.Header.Set("User-Agent", "GitHubCopilotChat/0.12.0")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		log.Printf("[AIFilter] Error fetching session token: %v\n", err)
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		log.Printf("[AIFilter] Failed to fetch session token. HTTP Status: %d\n", resp.StatusCode)
		return "", fmt.Errorf("failed to fetch copilot session token, status: %d", resp.StatusCode)
	}

	var tokenResp CopilotTokenResponse
	if err := json.NewDecoder(resp.Body).Decode(&tokenResp); err != nil {
		log.Printf("[AIFilter] Error decoding session token response: %v\n", err)
		return "", err
	}

	log.Println("[AIFilter] Successfully fetched new Copilot session token.")
	return tokenResp.Token, nil
}

func updateWikiToken(supabaseURL, anonKey, targetID, newToken string) {
	log.Println("[AIFilter] Updating session token in Supabase...")
	payload, err := json.Marshal(map[string]string{
		"value": newToken,
	})
	if err != nil {
		log.Printf("[AIFilter] Error marshaling token payload: %v\n", err)
		return
	}

	res := token.UpdateWikiVariable(bytes.NewReader(payload), supabaseURL, anonKey, targetID)
	log.Printf("[AIFilter] UpdateWikiVariable result: %+v\n", res)
}

func AIFilter(
	ctx context.Context,
	userID string,
	isDebug bool,
	content string,
	supabaseURL string,
	anonKey string,
	progressCallback func(progress int),
) string {
	const targetID string = "67144150-8684-4424-87e7-d9d4055d8bc8"
	isAdmin := pkg.AdminerUserId[userID]

	log.Printf("[AIFilter] Execution started. UserID: %s, IsAdmin: %t, IsDebug: %t\n", userID, isAdmin, isDebug)

	// 管理者ではない、またはデバッグフラグが立っている場合のみ実行
	if !isAdmin || isDebug {
		if progressCallback != nil {
			progressCallback(5)
		}

		wikiVar, err := token.FetchWikiVariable(supabaseURL, anonKey, targetID)
		if err != nil {
			log.Printf("[AIFilter] FetchWikiVariable error: %v\n", err)
		}

		sessionToken := ""
		if wikiVar != nil {
			sessionToken = wikiVar.Value
			log.Printf("[AIFilter] Loaded cached session token (Length: %d)\n", len(sessionToken))
		} else {
			log.Println("[AIFilter] No cached session token found in DB.")
		}

		paragraphs := strings.Split(content, "\n")
		processedParagraphs := make([]string, len(paragraphs))

		targetKeywords := []string{"名前は", "有利", "長い", "なまな"}

		for i, paragraph := range paragraphs {
			if progressCallback != nil {
				progress := 5 + int(float64(i+1)/float64(len(paragraphs))*90)
				progressCallback(progress)
			}

			hasKeyword := false
			for _, kw := range targetKeywords {
				if strings.Contains(paragraph, kw) {
					hasKeyword = true
					break
				}
			}

			if strings.TrimSpace(paragraph) == "" || !hasKeyword {
				log.Printf("[AIFilter] Paragraph [%d/%d] skipped (Empty or no target keyword).\n", i+1, len(paragraphs))
				processedParagraphs[i] = paragraph
				continue
			}

			log.Printf("[AIFilter] Paragraph [%d/%d] target keyword matched. Processing with Copilot API...\n", i+1, len(paragraphs))

			// トークンが空の場合はあらかじめ取得＆更新
			if sessionToken == "" {
				log.Println("[AIFilter] Session token is empty. Initializing fetch...")
				newToken, err := fetchCopilotSessionToken(ctx)
				if err == nil && newToken != "" {
					sessionToken = newToken
					updateWikiToken(supabaseURL, anonKey, targetID, sessionToken)
				} else {
					log.Printf("[AIFilter] Initial token fetch failed: %v\n", err)
				}
			}

			processed, err := processParagraphWithCopilot(ctx, sessionToken, paragraph)

			if _, is401 := err.(*ErrUnauthorized); is401 {
				log.Println("[AIFilter] Received 401 Unauthorized. Attempting token refresh and retry...")
				newToken, fetchErr := fetchCopilotSessionToken(ctx)
				if fetchErr == nil && newToken != "" {
					sessionToken = newToken
					updateWikiToken(supabaseURL, anonKey, targetID, sessionToken)

					// 新トークンで再度呼び出し
					processed, err = processParagraphWithCopilot(ctx, sessionToken, paragraph)
				} else {
					log.Printf("[AIFilter] Token refresh during 401 retry failed: %v\n", fetchErr)
				}
			}

			if err != nil || processed == "" {
				log.Printf("[AIFilter] Paragraph [%d/%d] Copilot processing failed or empty (Error: %v). Falling back to original.\n", i+1, len(paragraphs), err)
				processedParagraphs[i] = paragraph
			} else {
				log.Printf("[AIFilter] Paragraph [%d/%d] Copilot processing succeeded.\n", i+1, len(paragraphs))
				processedParagraphs[i] = processed
			}
		}

		if progressCallback != nil {
			progressCallback(100)
		}

		log.Println("[AIFilter] Execution completed.")
		return strings.Join(processedParagraphs, "\n")
	}

	log.Println("[AIFilter] Skipped processing because user is Admin and IsDebug is false.")
	return content
}

func processParagraphWithCopilot(ctx context.Context, sessionToken string, paragraph string) (string, error) {
	// 制御文字のクリーンアップ
	cleanParagraph := strings.ReplaceAll(paragraph, "\r", "")

	reqBody := ChatRequest{
		Messages: []ChatMessage{
			{
				Role: "system",
				Content: `あなたは特定表現の検閲フィルターです。
【タスク】
入力テキスト内に「名前は長い方が有利...」という趣旨の人物・意見・主張に対して【肯定・賛成・好意・擁護】を示している具体的な単語やフレーズが存在する場合、その【該当する文字・単語のみ】を同数の「*」に置き換えてください。

【絶対ルール】
- 該当する「肯定・好意・擁護の言葉」のみを局所的に「*」へ変換してください。
- 感嘆符（!!）、記号、関係のない本文、文脈の説明部分は一切変更せず原文のまま維持してください。
- 前置きや解説コメントは一切出力せず、**変換後の本文のみ**を出力してください。
- 名前は長い方が有利の荒らしカウント、名前は長い方が有利に騙されてる、名前は長い方が有利反対などの否定的なものはそのまま出力してください。

【変換例】
入力: 名前は長い方が有利大好きだ!!
出力: *************!!`,
			},
			{
				Role:    "user",
				Content: cleanParagraph,
			},
		},
		Model:       "gpt-4o-2024-05-13",
		Temperature: 0,
		Stream:      true,
		Intent:      true,
	}

	jsonBytes, err := json.Marshal(reqBody)
	if err != nil {
		return "", err
	}

	log.Printf("[AIFilter] Sending payload to Copilot (Len: %d): %s\n", len(jsonBytes), string(jsonBytes))

	req, err := http.NewRequestWithContext(ctx, "POST", "https://api.individual.githubcopilot.com/chat/completions", bytes.NewBuffer(jsonBytes))
	if err != nil {
		return "", err
	}

	req.Header.Set("Authorization", "Bearer "+sessionToken)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("User-Agent", "GitHubCopilotChat/0.68.0")
	req.Header.Set("editor-version", "vscode/1.140.0")
	req.Header.Set("editor-plugin-version", "copilot-chat/0.68.0")
	req.Header.Set("copilot-integration-id", "vscode-chat")
	req.Header.Set("x-github-api-version", "2026-08-01")
	req.Header.Set("x-interaction-type", "conversation-other")
	req.Header.Set("x-initiator", "user")
	req.Header.Set("priority", "u=4, i")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		log.Printf("[AIFilter] HTTP Request error to Copilot API: %v\n", err)
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusUnauthorized {
		log.Println("[AIFilter] Copilot API returned 401 Unauthorized.")
		return "", &ErrUnauthorized{StatusCode: resp.StatusCode}
	}

	if resp.StatusCode != http.StatusOK {
		log.Printf("[AIFilter] Copilot API returned non-200 status: %d\n", resp.StatusCode)
		return "", fmt.Errorf("copilot api error status: %d", resp.StatusCode)
	}

	scanner := bufio.NewScanner(resp.Body)
	var accumulatedContent strings.Builder

	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())

		if strings.HasPrefix(line, "data:") && !strings.Contains(line, "[DONE]") {
			jsonStr := strings.TrimSpace(strings.TrimPrefix(line, "data:"))

			var streamResp StreamResponse
			if err := json.Unmarshal([]byte(jsonStr), &streamResp); err == nil {
				if len(streamResp.Choices) > 0 {
					accumulatedContent.WriteString(streamResp.Choices[0].Delta.Content)
				}
			}
		}
	}

	if err := scanner.Err(); err != nil {
		log.Printf("[AIFilter] Scanner error reading stream: %v\n", err)
		return "", err
	}

	return accumulatedContent.String(), nil
}
