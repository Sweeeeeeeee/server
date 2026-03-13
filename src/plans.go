package main

import (
	"net/http"
	"time"
	"strconv"
	"encoding/json"

	_ "github.com/mattn/go-sqlite3"
)

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

	month, err := time.Parse(time.Layout, r.URL.Query().Get("month"))
	if err != nil {
		http.Error(w, DefaultError, StatusDefaultError)
	}

	day1 := month
	dayN := month.AddDate(0, 1, -1)

	plans, err := s.db.Query(
		`
			SELECT id, date, timeFrom, timeTo, text 
			FROM calendarPlans 
			WHERE username=? AND date=? BETWEEN ? AND ?
			ORDER BY date ASC, timeFrom ASC
		`,
		ck.user,
		day1.Format(time.Layout),
		dayN.Format(time.Layout),
	)
	if err != nil {
		http.Error(w, DefaultError, StatusDefaultError)
		return
	}
	defer plans.Close()

	type Plan struct {
		ID string 		`json:"id"`
		TimeFrom string `json:"timeFrom"`
		TimeTo string 	`json:"timeTo"`
		Text string 	`jsno:"text"`
	}

	plansDate := make(map[string][]Plan)

	for plans.Next() {
		var id int
		var date, timeFrom, timeTo, text string

		if err := plans.Scan(&id, &date, &timeFrom, &timeTo, &text); err != nil {
			continue
		}

		plansDate[date] = append(plansDate[date], Plan{
			ID: 		strconv.Itoa(id),
			TimeFrom: 	timeFrom,
			TimeTo:		timeTo,
			Text:		text,
		})
	}

	var res []map[string]interface{}

	for d := day1; !d.After(dayN); d = d.AddDate(0, 0, 1) {
		dateStr := d.Format(time.Layout)

		res = append(res, map[string]interface{} {
			"date": 	dateStr,
			"plans":	plansDate[dateStr],
		})
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
		Date string `json:"date"`
		TimeFrom string `json:"timeFrom"`
		TimeTo string `json:"timeTo"`
		Text string `json:"text"`
	}
	
	if err := json.NewDecoder(r.Body).Decode(&data); err != nil {
		http.Error(w, DefaultError, StatusDefaultError)
		return
	}

	if _, err := s.db.Exec(
		"INSERT INTO calendarPlans(username, date, text) VALUES(?, ?, ?)",
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
