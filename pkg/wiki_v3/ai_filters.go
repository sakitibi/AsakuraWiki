package wiki_v3

import (
	"bufio"
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strings"

	"asakura-wiki.vercel.app/pkg"
)

type ChatMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type ChatRequest struct {
	Messages    []ChatMessage `json:"messages"`
	Model       string        `json:"model"`
	Temperature float64       `json:"temperature"`
	Stream      bool          `json:"stream"`
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

func AIFilter(
	ctx context.Context,
	userID string,
	isDebug bool,
	content string,
	supabaseURL string,
	anonKey string,
	progressCallback func(progress int),
) string {
	isAdmin := pkg.AdminerUserId[userID]

	if !isAdmin || isDebug {
		if progressCallback != nil {
			progressCallback(5)
		}

		githubToken := strings.TrimSpace(os.Getenv("GITHUB_COPILOT_TOKEN"))
		if githubToken == "" {
			log.Println("[AIFilter] ERROR: GITHUB_COPILOT_TOKEN is missing!")
			return content
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
				processedParagraphs[i] = paragraph
				continue
			}

			processed, err := processParagraphWithCopilot(ctx, githubToken, paragraph)

			if err != nil || processed == "" {
				log.Printf("[AIFilter] Paragraph [%d/%d] processing failed: %v\n", i+1, len(paragraphs), err)
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

func processParagraphWithCopilot(ctx context.Context, githubToken string, paragraph string) (string, error) {
	cleanParagraph := strings.ReplaceAll(paragraph, "\r", "")

	reqBody := ChatRequest{
		Messages: []ChatMessage{
			{
				Role: "system",
				Content: `あなたは特定表現の検閲フィルターです。
【タスク】
入力テキスト内に「名前は長い方が有利...」という人物に対して【肯定・賛成・好意・擁護】を示している具体的な単語やフレーズが存在する場合、その【該当する文字・単語のみ】を同数の「*」に置き換えてください。

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
		Model:       "gpt-4o",
		Temperature: 0,
		Stream:      true,
	}

	jsonBytes, err := json.Marshal(reqBody)
	if err != nil {
		return "", err
	}

	req, err := http.NewRequestWithContext(ctx, "POST", "https://api.individual.githubcopilot.com/chat/completions", bytes.NewBuffer(jsonBytes))
	if err != nil {
		return "", err
	}

	req.Header.Set("Authorization", "Bearer "+githubToken)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("User-Agent", "GitHubCopilotChat/0.68.0")
	req.Header.Set("editor-version", "vscode/1.140.0")
	req.Header.Set("editor-plugin-version", "copilot-chat/0.68.0")
	req.Header.Set("copilot-integration-id", "vscode-chat")
	req.Header.Set("x-github-api-version", "2026-08-01")
	req.Header.Set("x-interaction-type", "conversation-other")
	req.Header.Set("x-initiator", "user")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		bodyBytes, readErr := io.ReadAll(resp.Body)
		if readErr == nil {
			log.Printf("[AIFilter] Copilot API Error (Status %d): %s\n", resp.StatusCode, string(bodyBytes))
		}
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
		return "", err
	}

	return accumulatedContent.String(), nil
}
