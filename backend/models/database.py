"""
GESTURA AI - SQLite Database Layer
Stores session telemetry, benchmark runs, and audit logs.
"""

import os
import sqlite3
import json
import time
from typing import List, Dict, Any, Optional

DB_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(DB_DIR, "gestura.db")


def get_connection():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn


def init_db(db_path: Optional[str] = None):
    global DB_PATH
    if db_path:
        DB_PATH = db_path

    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    with get_connection() as conn:
        cursor = conn.cursor()

        # Telemetry logs table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS telemetry_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT DEFAULT 'web',
                gesture TEXT NOT NULL,
                confidence REAL NOT NULL,
                action TEXT,
                latency_ms REAL NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # Benchmark runs table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS benchmark_runs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                suite_name TEXT NOT NULL,
                total_samples INTEGER NOT NULL,
                accuracy REAL NOT NULL,
                avg_latency_ms REAL NOT NULL,
                results TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # Sessions table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS sessions (
                session_id TEXT PRIMARY KEY,
                started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                client_info TEXT
            )
        """)

        # Calibration settings table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS calibration_settings (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        conn.commit()


def log_telemetry_event(
    gesture: str,
    confidence: float,
    action: Optional[str] = None,
    latency_ms: float = 0.0,
    session_id: str = "web"
) -> int:
    try:
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO telemetry_logs (session_id, gesture, confidence, action, latency_ms)
                VALUES (?, ?, ?, ?, ?)
            """, (session_id, gesture, float(confidence), action, float(latency_ms)))
            conn.commit()
            return cursor.lastrowid
    except Exception as e:
        print(f"[DB Error] log_telemetry_event failed: {e}")
        return -1


def get_recent_telemetry(limit: int = 30) -> List[Dict[str, Any]]:
    try:
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT id, session_id, gesture, confidence, action, latency_ms, created_at
                FROM telemetry_logs
                ORDER BY id DESC
                LIMIT ?
            """, (limit,))
            rows = cursor.fetchall()
            return [dict(row) for row in rows]
    except Exception as e:
        print(f"[DB Error] get_recent_telemetry failed: {e}")
        return []


def save_benchmark_result(
    suite_name: str,
    total_samples: int,
    accuracy: float,
    avg_latency_ms: float,
    results: Dict[str, Any]
) -> int:
    try:
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO benchmark_runs (suite_name, total_samples, accuracy, avg_latency_ms, results)
                VALUES (?, ?, ?, ?, ?)
            """, (
                suite_name,
                int(total_samples),
                float(accuracy),
                float(avg_latency_ms),
                json.dumps(results)
            ))
            conn.commit()
            return cursor.lastrowid
    except Exception as e:
        print(f"[DB Error] save_benchmark_result failed: {e}")
        return -1


def get_recent_benchmarks(limit: int = 10) -> List[Dict[str, Any]]:
    try:
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT id, suite_name, total_samples, accuracy, avg_latency_ms, results, created_at
                FROM benchmark_runs
                ORDER BY id DESC
                LIMIT ?
            """, (limit,))
            rows = cursor.fetchall()
            results_list = []
            for row in rows:
                item = dict(row)
                try:
                    item["results"] = json.loads(item["results"])
                except Exception:
                    pass
                results_list.append(item)
            return results_list
    except Exception as e:
        print(f"[DB Error] get_recent_benchmarks failed: {e}")
        return []
