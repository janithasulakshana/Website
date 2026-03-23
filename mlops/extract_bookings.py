#!/usr/bin/env python3
"""Extract bookings data from SQLite for ML training."""

from __future__ import annotations

import argparse
import csv
import os
import sqlite3
from pathlib import Path


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Extract bookings rows from SQLite into CSV")
    parser.add_argument("--db-path", default="backend/bookings.db", help="Path to SQLite database")
    parser.add_argument(
        "--output",
        default="mlops/artifacts/datasets/bookings.csv",
        help="Output CSV path",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    db_path = Path(args.db_path)
    output_path = Path(args.output)

    if not db_path.exists():
        print(f"Database not found: {db_path}")
        return 1

    output_path.parent.mkdir(parents=True, exist_ok=True)

    query = """
        SELECT
            id,
            name,
            email,
            phone,
            tour_id,
            date,
            status,
            created_at
        FROM bookings
        ORDER BY date ASC
    """

    with sqlite3.connect(db_path) as conn, output_path.open("w", newline="", encoding="utf-8") as f:
        conn.row_factory = sqlite3.Row
        rows = conn.execute(query).fetchall()
        writer = csv.DictWriter(
            f,
            fieldnames=["id", "name", "email", "phone", "tour_id", "date", "status", "created_at"],
        )
        writer.writeheader()
        for row in rows:
            writer.writerow(dict(row))

    print(f"Extracted {len(rows)} rows to {output_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
