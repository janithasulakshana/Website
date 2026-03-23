#!/usr/bin/env python3
"""Train a lightweight demand model, evaluate it, and package artifacts."""

from __future__ import annotations

import argparse
import csv
import datetime as dt
import json
import os
import tarfile
from collections import defaultdict
from pathlib import Path
from statistics import mean


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Train and package demand model artifacts")
    parser.add_argument("--input", default="mlops/artifacts/datasets/bookings.csv", help="Input bookings CSV")
    parser.add_argument("--output-dir", default="mlops/artifacts/models", help="Model output directory")
    parser.add_argument("--model-name", default="tour-demand-forecast", help="Model name")
    parser.add_argument("--version", default="", help="Model version (defaults to timestamp)")
    parser.add_argument("--git-sha", default=os.getenv("GITHUB_SHA", "local"), help="Git SHA metadata")
    parser.add_argument("--test-ratio", type=float, default=0.2, help="Holdout ratio by date")
    return parser.parse_args()


def load_bookings(path: Path) -> list[dict]:
    with path.open("r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        return [row for row in reader if row.get("date")]


def aggregate_counts(rows: list[dict]) -> dict[tuple[str, int], int]:
    counts: dict[tuple[str, int], int] = defaultdict(int)
    for row in rows:
        tour_id = str(row["tour_id"])
        date = dt.date.fromisoformat(row["date"])
        counts[(tour_id, date.toordinal())] += 1
    return counts


def split_dates(ordinals: list[int], test_ratio: float) -> tuple[set[int], set[int]]:
    unique = sorted(set(ordinals))
    if len(unique) < 2:
        return set(unique), set(unique)
    test_size = max(1, int(len(unique) * test_ratio))
    train = set(unique[:-test_size])
    test = set(unique[-test_size:])
    if not train:
        train = set(unique)
    return train, test


def build_weekday_model(counts: dict[tuple[str, int], int], train_days: set[int]) -> dict:
    grouped: dict[str, dict[int, list[int]]] = defaultdict(lambda: defaultdict(list))
    for (tour_id, ordinal), count in counts.items():
        if ordinal in train_days:
            weekday = dt.date.fromordinal(ordinal).weekday()
            grouped[tour_id][weekday].append(count)

    model: dict[str, dict[str, float]] = {}
    for tour_id, by_weekday in grouped.items():
        model[tour_id] = {}
        base = []
        for weekday, values in by_weekday.items():
            avg = float(mean(values))
            model[tour_id][str(weekday)] = round(avg, 4)
            base.extend(values)
        model[tour_id]["default"] = round(float(mean(base)) if base else 1.0, 4)
    return model


def predict(model: dict, tour_id: str, ordinal: int) -> float:
    weekday = str(dt.date.fromordinal(ordinal).weekday())
    if tour_id in model:
        return model[tour_id].get(weekday, model[tour_id].get("default", 1.0))
    return 1.0


def evaluate(model: dict, counts: dict[tuple[str, int], int], test_days: set[int]) -> dict:
    errors = []
    for (tour_id, ordinal), actual in counts.items():
        if ordinal not in test_days:
            continue
        pred = predict(model, tour_id, ordinal)
        errors.append(abs(actual - pred))

    mae = float(mean(errors)) if errors else 0.0
    return {
        "mae": round(mae, 4),
        "samples": len(errors),
    }


def main() -> int:
    args = parse_args()
    input_path = Path(args.input)
    if not input_path.exists():
        print(f"Input dataset not found: {input_path}")
        return 1

    version = args.version or dt.datetime.utcnow().strftime("%Y%m%d%H%M%S")
    model_dir = Path(args.output_dir) / args.model_name / version
    model_dir.mkdir(parents=True, exist_ok=True)

    rows = load_bookings(input_path)
    if not rows:
        print("No rows found in dataset")
        return 1

    counts = aggregate_counts(rows)
    ordinals = [ordinal for _, ordinal in counts.keys()]
    train_days, test_days = split_dates(ordinals, args.test_ratio)
    model = build_weekday_model(counts, train_days)
    metrics = evaluate(model, counts, test_days)

    train_start = dt.date.fromordinal(min(train_days)).isoformat() if train_days else ""
    train_end = dt.date.fromordinal(max(train_days)).isoformat() if train_days else ""

    metadata = {
        "model_name": args.model_name,
        "version": version,
        "git_sha": args.git_sha,
        "created_at": dt.datetime.utcnow().isoformat() + "Z",
        "training_window": {"start": train_start, "end": train_end},
        "records": len(rows),
    }

    model_payload = {
        "metadata": metadata,
        "model": model,
    }

    model_json = model_dir / "model.json"
    metrics_json = model_dir / "metrics.json"
    with model_json.open("w", encoding="utf-8") as f:
        json.dump(model_payload, f, indent=2)
    with metrics_json.open("w", encoding="utf-8") as f:
        json.dump(metrics, f, indent=2)

    archive_path = model_dir / "model.tar.gz"
    with tarfile.open(archive_path, "w:gz") as tar:
        tar.add(model_json, arcname="model.json")
        tar.add(metrics_json, arcname="metrics.json")

    latest = {
        "model_name": args.model_name,
        "version": version,
        "artifact": str(archive_path).replace("\\", "/"),
        "metrics": metrics,
    }
    latest_path = Path(args.output_dir) / args.model_name / "latest.json"
    latest_path.parent.mkdir(parents=True, exist_ok=True)
    with latest_path.open("w", encoding="utf-8") as f:
        json.dump(latest, f, indent=2)

    print(f"Model packaged: {archive_path}")
    print(f"Metrics: MAE={metrics['mae']} samples={metrics['samples']}")
    print(f"Latest pointer updated: {latest_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
