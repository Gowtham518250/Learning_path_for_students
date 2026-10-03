import json
import sqlite3
from contextlib import contextmanager
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Optional
from .config import database_path

DB_PATH = database_path()
Path(DB_PATH).parent.mkdir(parents=True, exist_ok=True)

SCHEMA = """
CREATE TABLE IF NOT EXISTS users (
 id TEXT PRIMARY KEY,
 email TEXT NOT NULL UNIQUE,
 full_name TEXT NOT NULL,
 password_hash TEXT NOT NULL,
 is_active INTEGER NOT NULL DEFAULT 1,
 is_verified INTEGER NOT NULL DEFAULT 0,
 created_at TEXT NOT NULL,
 updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS refresh_tokens (
 jti TEXT PRIMARY KEY,
 user_id TEXT NOT NULL,
 token_hash TEXT NOT NULL,
 expires_at TEXT NOT NULL,
 revoked_at TEXT,
 FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS password_reset_tokens (
 token_hash TEXT PRIMARY KEY,
 user_id TEXT NOT NULL,
 expires_at TEXT NOT NULL,
 used_at TEXT,
 FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS verification_tokens (
 token_hash TEXT PRIMARY KEY,
 user_id TEXT NOT NULL,
 expires_at TEXT NOT NULL,
 used_at TEXT,
 FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS evidence (
 id TEXT PRIMARY KEY,
 user_id TEXT NOT NULL,
 title TEXT NOT NULL,
 source_type TEXT NOT NULL,
 content TEXT NOT NULL,
 extracted_skills TEXT NOT NULL DEFAULT '[]',
 confidence REAL NOT NULL DEFAULT 0,
 created_at TEXT NOT NULL,
 FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS analyses (
 id TEXT PRIMARY KEY,
 user_id TEXT NOT NULL,
 career_goal TEXT NOT NULL,
 payload TEXT NOT NULL,
 created_at TEXT NOT NULL,
 FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);
"""

def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()

@contextmanager
def connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()

def init_db() -> None:
    with connection() as conn:
        conn.executescript(SCHEMA)

def fetch_one(sql: str, params: tuple = ()) -> Optional[dict]:
    with connection() as conn:
        row = conn.execute(sql, params).fetchone()
        return dict(row) if row else None

def fetch_all(sql: str, params: tuple = ()) -> list[dict]:
    with connection() as conn:
        return [dict(r) for r in conn.execute(sql, params).fetchall()]

def execute(sql: str, params: tuple = ()) -> None:
    with connection() as conn:
        conn.execute(sql, params)

def json_dumps(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False)

def json_loads(value: str, fallback: Any):
    try:
        return json.loads(value)
    except Exception:
        return fallback
