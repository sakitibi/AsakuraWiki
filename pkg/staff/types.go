package staff

import "regexp"

type JSONProps struct {
	ID           int    `json:"id"`
	Name         string `json:"name"`
	Kana         string `json:"kana"`
	Dept         string `json:"dept"`
	Location     string `json:"location"`
	Seat         string `json:"seat"`
	Joined       string `json:"joined"`
	Team         string `json:"team"`
	Birthday     string `json:"birthday,omitempty"`
	Intro        string `json:"intro,omitempty"`
	Comment      string `json:"comment,omitempty"`
	Graduationed string `json:"graduationed,omitempty"`
}

type StaffDataResponse struct {
	StaffData []JSONProps `json:"staff_data"`
}

var BirthdayRegex = regexp.MustCompile(`\b(?:19\d{2}|200\d)年(\d{1,2})月(\d{1,2})日`)
