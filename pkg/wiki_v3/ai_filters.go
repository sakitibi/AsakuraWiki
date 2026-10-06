package wiki_v3

import (
	"bufio"
	"bytes"
	"context"
	"encoding/json"
	"fmt"
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
	MaxTokens   int           `json:"max_tokens"`
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
	req, err := http.NewRequestWithContext(ctx, "GET", "https://api.github.com/copilot_internal/v2/token", nil)
	if err != nil {
		return "", err
	}

	githubToken := os.Getenv("GITHUB_COPILOT_TOKEN")
	req.Header.Set("Authorization", "token "+githubToken)
	req.Header.Set("User-Agent", "GitHubCopilotChat/0.12.0")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("failed to fetch copilot session token, status: %d", resp.StatusCode)
	}

	var tokenResp CopilotTokenResponse
	if err := json.NewDecoder(resp.Body).Decode(&tokenResp); err != nil {
		return "", err
	}

	return tokenResp.Token, nil
}

// UpdateWikiVariable を呼び出すヘルパー関数
func updateWikiToken(supabaseURL, anonKey, targetID, newToken string) {
	// 更新用 JSON (テーブル構造に合わせてフィールド名は調整してください)
	payload, err := json.Marshal(map[string]string{
		"value": newToken,
	})
	if err != nil {
		return
	}

	// io.Reader を第一引数として渡す
	_ = token.UpdateWikiVariable(bytes.NewReader(payload), supabaseURL, anonKey, targetID)
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

	// 管理者ではない、またはデバッグフラグが立っている場合のみ実行
	if !isAdmin || isDebug {
		if progressCallback != nil {
			progressCallback(5)
		}

		wikiVar, _ := token.FetchWikiVariable(supabaseURL, anonKey, targetID)

		sessionToken := ""
		if wikiVar != nil {
			sessionToken = wikiVar.Value
		}

		paragraphs := strings.Split(content, "\n")
		processedParagraphs := make([]string, len(paragraphs))

		targetKeywords := []string{"名前は", "有利", "長い", "なまな"}

		for i, paragraph := range paragraphs {
			// 進捗率の計算と通知
			if progressCallback != nil {
				progress := 5 + int(float64(i+1)/float64(len(paragraphs))*90)
				progressCallback(progress)
			}

			// 空行またはキーワードを含まない段落は通信せずにスキップ
			hasKeyword := false
			for _, kw := range targetKeywords {
				if strings.Contains(paragraph, kw) {
					hasKeyword = true
					break
				}
			}

			if strings.TrimSpace(paragraph) == "" || !hasKeyword {
				processedParagraphs[i] = paragraph
				continue
			}

			// トークンが空の場合はあらかじめ取得＆更新
			if sessionToken == "" {
				newToken, err := fetchCopilotSessionToken(ctx)
				if err == nil && newToken != "" {
					sessionToken = newToken
					updateWikiToken(supabaseURL, anonKey, targetID, sessionToken)
				}
			}

			processed, err := processParagraphWithCopilot(ctx, sessionToken, paragraph)

			if _, is401 := err.(*ErrUnauthorized); is401 {
				newToken, fetchErr := fetchCopilotSessionToken(ctx)
				if fetchErr == nil && newToken != "" {
					sessionToken = newToken

					updateWikiToken(supabaseURL, anonKey, targetID, sessionToken)

					// 新トークンで再度呼び出し
					processed, err = processParagraphWithCopilot(ctx, sessionToken, paragraph)
				}
			}

			if err != nil || processed == "" {
				// エラーや空レスポンス時は原文をセット（フォールバック）
				processedParagraphs[i] = paragraph
			} else {
				processedParagraphs[i] = processed
			}
		}

		if progressCallback != nil {
			progressCallback(100)
		}

		return strings.Join(processedParagraphs, "\n")
	}

	return content
}

func processParagraphWithCopilot(ctx context.Context, sessionToken string, paragraph string) (string, error) {
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
				Content: paragraph,
			},
		},
		Model:       "gpt-4o",
		Temperature: 0,
		Stream:      true,
		MaxTokens:   2048,
	}

	jsonBytes, err := json.Marshal(reqBody)
	if err != nil {
		return "", err
	}

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
		return "", err
	}
	defer resp.Body.Close()

	// 401 Unauthorized の場合は専用エラーを返して呼び出し元でリトライさせる
	if resp.StatusCode == http.StatusUnauthorized {
		return "", &ErrUnauthorized{StatusCode: resp.StatusCode}
	}

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("copilot api error status: %d", resp.StatusCode)
	}

	// SSE (Server-Sent Events) ストリーミング処理
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
		return "", err
	}

	return accumulatedContent.String(), nil
}
