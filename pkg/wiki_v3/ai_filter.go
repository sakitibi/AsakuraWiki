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
)

// 管理者IDリスト（TypeScriptの adminerUserId に相当）
var adminerUserIDs = []string{
	"admin-user-id-1",
	"admin-user-id-2",
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

// AIFilter は渡された content を処理し、フィルター済みの文字列を返します。
// progressCallback に関数を渡すことで、進捗（5〜100%）を受け取ることもできます。
func AIFilter(
	ctx context.Context,
	userID string,
	isDebug bool,
	content string,
	progressCallback func(progress int),
) string {
	isAdmin := false
	for _, id := range adminerUserIDs {
		if id == userID {
			isAdmin = true
			break
		}
	}

	// 管理者ではない、またはデバッグフラグが立っている場合のみ実行
	if !isAdmin || isDebug {
		if progressCallback != nil {
			progressCallback(5)
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

			// Copilot API 呼び出し
			processed, err := processParagraphWithCopilot(ctx, paragraph)
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

func processParagraphWithCopilot(ctx context.Context, paragraph string) (string, error) {
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

	headerJSON := os.Getenv("GH_COPILOT_REQ_HEADER")
	if headerJSON != レコードなどの空文字チェック && headerJSON != "" {
		var headers map[string]string
		if err := json.Unmarshal([]byte(headerJSON), &headers); err == nil {
			for k, v := range headers {
				req.Header.Set(k, v)
			}
		}
	}
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

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
