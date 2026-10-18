-- Migration number: 0001 	 2026-10-18T05:28:01.929Z

CREATE TABLE users (
    id TEXT PRIMARY KEY,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL
);

CREATE TABLE EXPENSES (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id) NOT NULL,
    total INTEGER NOT NULL,
    spent_man INTEGER NOT NULL,
    spent_woman INTEGER NOT NULL,
    details TEXT,
    created_at TEXT NOT NULL
);
