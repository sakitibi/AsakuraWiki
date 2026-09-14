package staff

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strconv"

	"github.com/andybalholm/brotli"
)

func FetchAndDecompress(url string) ([]JSONProps, error) {
	resp, err := http.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("failed to fetch %s: %s", url, resp.Status)
	}

	brReader := brotli.NewReader(resp.Body)
	body, err := io.ReadAll(brReader)
	if err != nil {
		return nil, err
	}

	var data StaffDataResponse
	if err := json.Unmarshal(body, &data); err != nil {
		return nil, err
	}

	return data.StaffData, nil
}

func ProcessBirthdays(staffData []JSONProps) []JSONProps {
	results := make([]JSONProps, len(staffData))
	for index, data := range staffData {
		shouldSkipReplace := (index >= 77 && index <= 80) || (index >= 83 && index <= 90)

		if data.Birthday != "" {
			if shouldSkipReplace {
				var year string
				switch index {
				case 85:
					year = "2019"
				case 83:
					year = "2018"
				case 77, 86, 87:
					year = "2016"
				case 78, 88:
					year = "2015"
				case 79, 80, 90:
					year = "2014"
				}

				data.Birthday = BirthdayRegex.ReplaceAllStringFunc(data.Birthday, func(match string) string {
					submatches := BirthdayRegex.FindStringSubmatch(match)
					if len(submatches) < 3 {
						return match
					}
					return fmt.Sprintf("%s年%s月%s日", year, submatches[1], submatches[2])
				})
			} else {
				data.Birthday = BirthdayRegex.ReplaceAllStringFunc(data.Birthday, func(match string) string {
					submatches := BirthdayRegex.FindStringSubmatch(match)
					if len(submatches) < 3 {
						return match
					}
					m, _ := strconv.Atoi(submatches[1])
					d, _ := strconv.Atoi(submatches[2])

					isBeforeApril := (m >= 1 && m <= 3) || (m == 4 && d == 1)
					if isBeforeApril {
						return fmt.Sprintf("2014年%d月%d日", m, d)
					}
					return fmt.Sprintf("2013年%d月%d日", m, d)
				})
			}
		}
		results[index] = data
	}
	return results
}
