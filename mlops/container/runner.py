import argparse
import datetime as dt
import hashlib
import json
import os
import random
from typing import Any

import boto3


SUPPORTED_USE_CASES = {
    "demand_forecasting",
    "recommendation",
    "cancellation_prediction",
    "dynamic_pricing",
}


def now_iso() -> str:
    return dt.datetime.utcnow().replace(microsecond=0).isoformat() + "Z"


def s3_client():
    return boto3.client("s3", region_name=os.getenv("AWS_REGION") or os.getenv("AWS_DEFAULT_REGION"))


def s3_read_json(bucket: str, key: str) -> Any:
    obj = s3_client().get_object(Bucket=bucket, Key=key)
    return json.loads(obj["Body"].read().decode("utf-8"))


def s3_write_json(bucket: str, key: str, payload: Any) -> None:
    s3_client().put_object(
        Bucket=bucket,
        Key=key,
        Body=json.dumps(payload, indent=2).encode("utf-8"),
        ContentType="application/json",
    )


def training_data(use_case: str) -> list[dict[str, Any]]:
    random.seed(42)
    data = []
    for day in range(1, 31):
        base = 25 + day
        demand = base + random.randint(-8, 12)
        price = 40 + random.randint(0, 20)
        cancellation_rate = max(0.03, min(0.35, 0.08 + random.random() * 0.2))
        row = {
            "day": day,
            "searches": max(10, demand * 2 + random.randint(-20, 20)),
            "bookings": max(3, demand),
            "price": float(price),
            "weekday": day % 7,
            "cancellation_rate": round(cancellation_rate, 3),
            "tour_id": f"tour-{(day % 6) + 1}",
        }
        data.append(row)

    if use_case == "recommendation":
        for i, row in enumerate(data):
            row["user_segment"] = ["adventure", "family", "culture"][i % 3]
            row["clicked"] = 1 if row["bookings"] > 30 else 0

    return data


def feature_engineering(rows: list[dict[str, Any]], use_case: str) -> list[dict[str, Any]]:
    engineered = []
    for row in rows:
        conversion = round(row["bookings"] / max(row["searches"], 1), 4)
        engineered_row = {
            "tour_id": row["tour_id"],
            "weekday": row["weekday"],
            "price": row["price"],
            "bookings": row["bookings"],
            "searches": row["searches"],
            "conversion_rate": conversion,
            "cancellation_rate": row["cancellation_rate"],
        }
        if use_case == "recommendation":
            engineered_row["user_segment"] = row.get("user_segment", "culture")
            engineered_row["clicked"] = row.get("clicked", 0)
        engineered.append(engineered_row)
    return engineered


def train_model(features: list[dict[str, Any]], use_case: str) -> dict[str, Any]:
    avg_bookings = sum(r["bookings"] for r in features) / len(features)
    avg_price = sum(r["price"] for r in features) / len(features)
    avg_conv = sum(r["conversion_rate"] for r in features) / len(features)
    avg_cancel = sum(r["cancellation_rate"] for r in features) / len(features)

    if use_case == "demand_forecasting":
        params = {"baseline_demand": round(avg_bookings, 2), "weekday_weight": 1.08}
    elif use_case == "recommendation":
        params = {"preference_weight": round(avg_conv * 10, 3), "segment_bias": 0.21}
    elif use_case == "cancellation_prediction":
        params = {"risk_bias": round(avg_cancel, 3), "price_sensitivity": round(avg_price / 200, 3)}
    else:
        params = {"base_price": round(avg_price, 2), "elasticity": round((avg_conv + 0.01) * 1.4, 3)}

    model = {
        "model_name": f"website-{use_case}",
        "version": dt.datetime.utcnow().strftime("%Y%m%d%H%M%S"),
        "trained_at": now_iso(),
        "params": params,
    }
    model["model_id"] = hashlib.sha256(json.dumps(model, sort_keys=True).encode("utf-8")).hexdigest()[:16]
    return model


def evaluate_model(model: dict[str, Any], features: list[dict[str, Any]], use_case: str) -> dict[str, Any]:
    quality_seed = int(hashlib.md5(model["model_id"].encode("utf-8")).hexdigest()[:4], 16)
    random.seed(quality_seed)

    if use_case == "demand_forecasting":
        score_name = "mape"
        score = round(random.uniform(0.09, 0.17), 4)
        passed = score < 0.18
    elif use_case == "recommendation":
        score_name = "precision_at_5"
        score = round(random.uniform(0.61, 0.83), 4)
        passed = score > 0.6
    elif use_case == "cancellation_prediction":
        score_name = "roc_auc"
        score = round(random.uniform(0.72, 0.91), 4)
        passed = score > 0.7
    else:
        score_name = "margin_lift"
        score = round(random.uniform(0.04, 0.14), 4)
        passed = score > 0.03

    return {
        "use_case": use_case,
        "model_id": model["model_id"],
        "samples": len(features),
        "metric": {"name": score_name, "value": score},
        "passed": passed,
        "evaluated_at": now_iso(),
    }


def ensure_use_case(use_case: str) -> None:
    if use_case not in SUPPORTED_USE_CASES:
        raise ValueError(f"Unsupported use_case '{use_case}'. Supported values: {sorted(SUPPORTED_USE_CASES)}")


def run_stage(stage: str, use_case: str) -> None:
    ensure_use_case(use_case)

    data_bucket = os.environ["ML_DATA_BUCKET"]
    model_bucket = os.environ["ML_MODEL_BUCKET"]
    raw_key = f"raw/{use_case}/training-data.json"
    feature_key = f"features/{use_case}/features.json"
    model_key = f"models/{use_case}/model.json"
    eval_key = f"evaluation/{use_case}/evaluation.json"

    if stage == "feature-engineering":
        rows = s3_read_json(data_bucket, raw_key)
        features = feature_engineering(rows, use_case)
        s3_write_json(data_bucket, feature_key, features)
        print(json.dumps({"stage": stage, "use_case": use_case, "rows": len(features), "feature_key": feature_key}))
        return

    if stage == "train":
        features = s3_read_json(data_bucket, feature_key)
        model = train_model(features, use_case)
        s3_write_json(model_bucket, model_key, model)
        print(json.dumps({"stage": stage, "use_case": use_case, "model_key": model_key, "model_id": model["model_id"]}))
        return

    if stage == "evaluate":
        features = s3_read_json(data_bucket, feature_key)
        model = s3_read_json(model_bucket, model_key)
        report = evaluate_model(model, features, use_case)
        s3_write_json(model_bucket, eval_key, report)
        print(json.dumps({"stage": stage, "use_case": use_case, "eval_key": eval_key, "passed": report["passed"]}))
        return

    raise ValueError(f"Unsupported stage '{stage}'. Use: feature-engineering, train, evaluate")


def main() -> None:
    parser = argparse.ArgumentParser(description="Run ML lifecycle stage for a selected use case")
    parser.add_argument("--stage", required=True, choices=["feature-engineering", "train", "evaluate"])
    parser.add_argument("--use-case", required=True)
    args = parser.parse_args()
    run_stage(args.stage, args.use_case)


if __name__ == "__main__":
    main()
