package main

import (
	"net/http"
	"strconv"
	"encoding/json"

	_ "github.com/mattn/go-sqlite3"
)

func (s *server) GetTodos(w http.ResponseWriter, r *http.Request) {
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
	
	type Todo struct {
		ID string 			`json:"id"`
		Date string 		`json:"date"`
		MarkedDate string	`json:"markedDate"`
		Duration string 	`json:"duration"`
		Permanent string 	`json:"permanent"`
		Text string 		`json:"text"`
	}
	todos, err := s.db.Query(
		`
			SELECT id, date, markedDate, duration, permanent, text
			FROM todos
			WHERE username = ?
			ORDER BY duration ASC, date ASC
		`,
		ck.user,
	)
	if err != nil {
		http.Error(w, DefaultError, StatusDefaultError)

		return
	}
	defer todos.Close()

	res := make([]Todo, 0)

	for todos.Next() {
		var id int
		var date, markedDate, duration, permanent, text string

		if todos.Scan(&id, &date, &markedDate, &duration, &permanent, &text) != nil {
			continue
		}

		res = append(res, Todo{
				ID: 		strconv.Itoa(id),
				Date: 		date,
				MarkedDate: markedDate,
				Duration:	duration,
				Permanent:	permanent,
				Text:		text,
			},
		)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(res)
}

func (s *server) UpdateTodo(w http.ResponseWriter, r *http.Request) {
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
		ID string 			`json:"id"`
		MarkedDate string	`json:"markedDate"`
		Duration string 	`json:"duration"`
		Permanent string	`json:"permanent"`
		Text string 		`json:"text"`
	}
	
	if err := json.NewDecoder(r.Body).Decode(&data); err != nil {
		http.Error(w, DefaultError, StatusDefaultError)
		
		return
	}

	if _, err := s.db.Exec(
		`
			UPDATE todos
			SET	markedDate = COALESCE(NULLIF(?, ""), markedDate),
				duration = COALESCE(NULLIF(?, ""), duration),
				permanent = COALESCE(NULLIF(?, ""), permanent),
				text = COALESCE(NULLIF(?, ""), text)
			WHERE id = ? AND username = ?
		`,
		data.MarkedDate,
		data.Duration,
		data.Permanent,
		data.Text,
		data.ID,
		ck.user,
	); err != nil {
		http.Error(w, DefaultError, StatusDefaultError)
		
		return
	}
}

func (s *server) AddTodo(w http.ResponseWriter, r *http.Request) {
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
		Date string 		`json:"date"`
		Duration string 	`json:"duration"`
		Permanent string	`json:"permanent"`
		Text string 		`json:"text"`
	}
	
	if err := json.NewDecoder(r.Body).Decode(&data); err != nil {
		http.Error(w, DefaultError, StatusDefaultError)
		
		return
	}

	if _, err := s.db.Exec(
		"INSERT INTO todos(username, date, markedDate, duration, permanent, text) VALUES(?, ?, ?, ?, ?, ?)",
		ck.user,
		data.Date,
		"",
		data.Duration,
		data.Permanent,
		data.Text,
	); err != nil {
		http.Error(w, DefaultError, StatusDefaultError)
		
		return
	}
}

func (s *server) DeleteTodo(w http.ResponseWriter, r *http.Request) {
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
	_, err = s.db.Exec("DELETE FROM todos WHERE id = ? AND username = ?", id, ck.user)
	if err != nil {
		http.Error(w, DefaultError, StatusDefaultError)
		
		return
	}
}
