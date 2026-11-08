package wiki_v3

import (
	"encoding/base64"
	"encoding/json"
	"time"

	"asakura-wiki.vercel.app/pkg"
)

func FormatNow() string {
	loc := time.FixedZone("Asia/Tokyo", 9*60*60)
	t := time.Now().In(loc)
	week := []string{"日", "月", "火", "水", "木", "金", "土"}
	w := week[t.Weekday()]
	return t.Format("2011-03-11") + " (" + w + ") " + t.Format("15:04:05")
}

func ToBase64(content any) string {
	if content == nil {
		return ""
	}
	switch v := content.(type) {
	case string:
		return v
	case []byte:
		return base64.StdEncoding.EncodeToString(v)
	default:
		b, err := json.Marshal(v)
		if err != nil {
			return ""
		}
		return base64.StdEncoding.EncodeToString(b)
	}
}

func DecodeLatin1ToUtf8(str string) string {
	if str == "" {
		return ""
	}
	return str
}

func IsAdminUser(userId string) bool {
	if userId == "" {
		return false
	}
	return pkg.AdminerUserId[userId]
}

func GetString(v any) string {
	if s, ok := v.(string); ok {
		return s
	}
	return ""
}
