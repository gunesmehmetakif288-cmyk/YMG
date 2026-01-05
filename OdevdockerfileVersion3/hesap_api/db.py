import os
import time
from typing import Any, Dict, List

import psycopg2
from psycopg2.extras import RealDictCursor


def _dsn() -> Dict[str, Any]:
    return {
        "host": os.getenv("DB_HOST", "localhost"),
        "port": int(os.getenv("DB_PORT", "5432")),
        "dbname": os.getenv("DB_NAME", "calcdb"),
        "user": os.getenv("DB_USER", "calc"),
        "password": os.getenv("DB_PASSWORD", "calcpass"),
    }


def get_conn():
    return psycopg2.connect(**_dsn())


def wait_for_db(timeout_sec: int = 30, max_seconds: int | None = None) -> None:
    """DB hazır olana kadar bekler.

    Not: Eski kodlarla uyum için `max_seconds` parametresi de desteklenir.
    """
    if max_seconds is not None:
        timeout_sec = int(max_seconds)

    start = time.time()
    while True:
        try:
            with get_conn() as conn:
                with conn.cursor() as cur:
                    cur.execute('SELECT 1')
            return
        except Exception:
            if (time.time() - start) > timeout_sec:
                raise
            time.sleep(1)

def init_db() -> None:
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                CREATE TABLE IF NOT EXISTS calc_history (
                    id BIGSERIAL PRIMARY KEY,
                    islem TEXT NOT NULL,
                    sayi1 DOUBLE PRECISION NOT NULL,
                    sayi2 DOUBLE PRECISION NULL,
                    sonuc DOUBLE PRECISION NOT NULL,
                    ts TIMESTAMPTZ NOT NULL DEFAULT NOW()
                );
                """
            )


def insert_history(islem: str, sayi1: float, sayi2: float | None, sonuc: float) -> None:
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO calc_history (islem, sayi1, sayi2, sonuc)
                VALUES (%s, %s, %s, %s)
                """,
                (islem, sayi1, sayi2, sonuc),
            )


def fetch_history(limit: int = 200) -> List[Dict[str, Any]]:
    with get_conn() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """
                SELECT id, islem, sayi1, sayi2, sonuc, ts
                FROM calc_history
                ORDER BY id DESC
                LIMIT %s
                """,
                (limit,),
            )
            rows = cur.fetchall()

    out: List[Dict[str, Any]] = []
    for r in rows:
        ts = r.get("ts")
        r["timestamp"] = ts.isoformat() if ts else None
        r.pop("ts", None)
        out.append(r)
    return out


def clear_history() -> int:
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("DELETE FROM calc_history")
            return cur.rowcount
