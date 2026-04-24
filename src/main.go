package main

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"net/http"
	"sync"
	"time"

	"database/sql"
	_ "github.com/mattn/go-sqlite3"
)

type cookie struct {
	user string

	expiration time.Time
}

type route struct {
	path  	string
	handler func(http.ResponseWriter, *http.Request)
	html string
}

type server struct {
	db *sql.DB

	routes []route

	cookies map[string]cookie

	mutex sync.Mutex
}

func (s *server) newCookie(username string) string {
	s.mutex.Lock()
	defer s.mutex.Unlock()

	b := make([]byte, 32)
	rand.Read(b)

	token := hex.EncodeToString(b)

	s.cookies[token] = cookie{username, time.Now().Add(2 * time.Hour)}

	return token
}

func (s *server) confirm(c *http.Cookie) (*cookie, bool) {
	s.mutex.Lock()
	defer s.mutex.Unlock()

	ck, ok := s.cookies[c.Value];
	if !(ok && ck.expiration.After(time.Now())) {
		return nil, false
	}

	return &ck, true
}

func (s *server) authenticate(username string, password string) bool {
	var validPassword string
	err := s.db.QueryRow("SELECT password FROM users WHERE username=?", username).Scan(&validPassword)

	return err == nil && password == validPassword
}

func (s *server) loginPage(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "templates/login.html")
}

func (s *server) loginAPI(w http.ResponseWriter, r *http.Request) {
	var data map[string]string
	json.NewDecoder(r.Body).Decode(&data)

	if !s.authenticate(data["username"], data["password"]) {
		w.WriteHeader(http.StatusUnauthorized)

		return
	}

	token := s.newCookie(data["username"])
	http.SetCookie(w, &http.Cookie{Name: "auth", Value: token, Path: "/"})
}

func (s *server) logoutAPI(w http.ResponseWriter, r *http.Request) {
	http.SetCookie(w, &http.Cookie{Name: "auth", Value: "false", Path: "/"})
}

func newServer() *server {
	db, err := sql.Open("sqlite3", "db/app.db")
	if err != nil {
		panic(err)
	}
	s := &server{mutex: sync.Mutex{}, db: db, routes: make([]route, 0), cookies: make(map[string]cookie)}

	s.routes = []route{
		{path: "/login", handler: (*s).loginPage, html: "templates/login.html"},
		{path: "/api/login", handler: (*s).loginAPI, html: ""},
		{path: "/api/logout", handler: (*s).logoutAPI, html: ""},
		{path: "/", handler: nil, html: "templates/home.html"},
		{path: "/home", handler: nil, html: "templates/home.html"},
		{path: "/calendar", handler: nil, html: "templates/calendar.html"},

		{path: "/api/plans", handler: (*s).GetPlans, html: ""},
		{path: "/api/plans/add", handler: (*s).AddPlan, html: ""},
		{path: "/api/plans/delete", handler: (*s).DeletePlan, html: ""},
	}

	return s
}

func (s *server) Run() {
	for _, rt := range s.routes {
		if (rt.handler != nil) {
			http.HandleFunc(rt.path, rt.handler)
		}else {
			temp := rt
			http.HandleFunc(rt.path, func(w http.ResponseWriter, r *http.Request) {
					c, err := r.Cookie("auth")
					if err != nil {
						http.Redirect(w, r, "/login", http.StatusFound)

						return
					}

					if _, ok := s.confirm(c); !ok {
						http.Redirect(w, r, "/login", http.StatusFound)

						return
					}
		
					http.ServeFile(w, r, temp.html)
				},
			)
		}
	}

	http.Handle("/templates/", http.StripPrefix("/templates/", http.FileServer(http.Dir("templates"))))

	err := http.ListenAndServe(":80", nil)
	if err != nil {
		panic(err)
	}
}

func main() {
	server := newServer()
	server.Run()
}
