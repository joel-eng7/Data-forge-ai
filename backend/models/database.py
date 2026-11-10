import sqlite3
import os
import json
import hashlib
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "dataforge.db")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode = WAL")
    conn.execute("PRAGMA foreign_keys = ON")
    return conn

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode('utf-8')).hexdigest()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return hash_password(plain_password) == hashed_password

def init_db():
    conn = get_db()
    cursor = conn.cursor()

    # Users table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        full_name TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'Data Scientist',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # Datasets table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS datasets (
        id TEXT PRIMARY KEY,
        user_id INTEGER,
        name TEXT NOT NULL,
        filename TEXT NOT NULL,
        file_path TEXT NOT NULL,
        raw_file_path TEXT NOT NULL,
        source TEXT NOT NULL,
        format TEXT NOT NULL,
        original_rows INTEGER,
        original_cols INTEGER,
        current_rows INTEGER,
        current_cols INTEGER,
        file_size_bytes INTEGER,
        status TEXT DEFAULT 'Ready',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
    );
    """)

    # Pipeline Steps table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS pipeline_steps (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        dataset_id TEXT NOT NULL,
        step_number INTEGER NOT NULL,
        step_name TEXT NOT NULL,
        operation_type TEXT NOT NULL,
        parameters TEXT,
        rows_before INTEGER,
        rows_after INTEGER,
        cols_before INTEGER,
        cols_after INTEGER,
        execution_time_ms REAL,
        details TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (dataset_id) REFERENCES datasets(id) ON DELETE CASCADE
    );
    """)

    # Pre-seed default user if not exists
    cursor.execute("SELECT id FROM users WHERE email = 'alex@dataforge.ai'")
    user = cursor.fetchone()
    if not user:
        cursor.execute(
            "INSERT INTO users (email, full_name, password_hash, role) VALUES (?, ?, ?, ?)",
            ('alex@dataforge.ai', 'Alex Morgan', hash_password('DataForge2025!'), 'Lead Data Scientist')
        )
        conn.commit()

    conn.close()

if __name__ == "__main__":
    init_db()
    print(f"Database initialized at {DB_PATH}")
