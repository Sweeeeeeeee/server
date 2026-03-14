package main

import (
	"net/http"
	"time"
	"strconv"
	"encoding/json"

	_ "github.com/mattn/go-sqlite3"
)

const LayoutYM = "2006-01"
const LayoutYMD = "2006-01-02"

func (s *server) GetPlans(w http.ResponseWriter, r *http.Request) {
	c, err := r.Cookie("auth")
	if err != nil {
		w.WriteHeader(StatusAccessError)

		return
	}

	ck, ok := s.confirm(c)
	if !ok {
		w.WriteHeader(StatusAccessError)

		return
	}
	
	month, err := time.Parse(LayoutYM, r.URL.Query().Get("date"))
	if err != nil {
		http.Error(w, DefaultError, StatusDefaultError)

		return
	}

	day1 := month
	dayN := month.AddDate(0, 1, -1)

	type Plan struct {
		ID string 		`json:"id"`
		TimeFrom string `json:"timeFrom"`
		TimeTo string 	`json:"timeTo"`
		Text string 	`json:"text"`
	}

	plans, err := s.db.Query(
		`
			SELECT id, date, timeFrom, timeTo, text 
			FROM calendarPlans 
			WHERE username = ? AND date BETWEEN ? AND ?
			ORDER BY date ASC, timeFrom ASC
		`,
		ck.user,
		day1.Format(LayoutYMD),
		dayN.Format(LayoutYMD),
	)
	if err != nil {
		http.Error(w, DefaultError, StatusDefaultError)

		return
	}
	defer plans.Close()

	res := make(map[int][]Plan)

	for plans.Next() {
		var id int
		var dateStr, timeFrom, timeTo, text string

		if plans.Scan(&id, &dateStr, &timeFrom, &timeTo, &text) != nil {
			continue
		}

		date, err := time.Parse(LayoutYMD, dateStr)
		if err != nil {
			http.Error(w, DefaultError, StatusDefaultError)

			return
		}
		day := date.Day()

		res[day] = append(res[day], Plan{
				ID: 		strconv.Itoa(id),
				TimeFrom: 	timeFrom,
				TimeTo:		timeTo,
				Text:		text,
			},
		)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(res)
}

func (s *server) AddPlan(w http.ResponseWriter, r *http.Request) {
	c, err := r.Cookie("auth")
	if err != nil {
		w.WriteHeader(StatusAccessError)

		return
	}

	ck, ok := s.confirm(c)
	if !ok {
		w.WriteHeader(StatusAccessError)

		return
	}

	var data struct {
		Date string 	`json:"date"`
		TimeFrom string `json:"timeFrom"`
		TimeTo string 	`json:"timeTo"`
		Text string 	`json:"text"`
	}
	
	if err := json.NewDecoder(r.Body).Decode(&data); err != nil {
		http.Error(w, DefaultError, StatusDefaultError)
		
		return
	}

	if _, err := s.db.Exec(
		"INSERT INTO calendarPlans(username, date, timeFrom, timeTo, text) VALUES(?, ?, ?, ?, ?)",
		ck.user,
		data.Date,
		data.TimeFrom,
		data.TimeTo,
		data.Text,
	); err != nil {
		http.Error(w, DefaultError, StatusDefaultError)
		
		return
	}
}

func (s *server) DeletePlan(w http.ResponseWriter, r *http.Request) {
	c, err := r.Cookie("auth")
	if err != nil {
		w.WriteHeader(StatusAccessError)

		return
	}

	ck, ok := s.confirm(c)
	if !ok {
		w.WriteHeader(StatusAccessError)

		return
	}

	id := r.URL.Query().Get("id")
	_, err = s.db.Exec("DELETE FROM calendarPlans WHERE id = ? AND username = ?", id, ck.user)
	if err != nil {
		http.Error(w, DefaultError, StatusDefaultError)
		
		return
	}
}
