CREATE TABLE users (
	username TEXT PRIMARY KEY,
	password TEXT NOT NULL
);

CREATE TABLE calendarPlans (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	username TEXT NOT NULL,
	date TEXT NOT NULL,
	text TEXT NOT NULL,
	FOREIGN KEY(username) REFERENCES users(username)
);
