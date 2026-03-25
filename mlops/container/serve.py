import json
import os
from typing import Any

import boto3
from flask import Flask, jsonify, request


app = Flask(__name__)

MODEL_BUCKET = os.environ.get("ML_MODEL_BUCKET", "")
DEFAULT_USE_CASE = os.environ.get("DEFAULT_USE_CASE", "demand_forecasting")


def model_key(use_case: str) -> str:
    return f"models/{use_case}/model.json"


def load_model(use_case: str) -> dict[str, Any]:
    if not MODEL_BUCKET:
        raise RuntimeError("ML_MODEL_BUCKET environment variable is required")

    s3 = boto3.client("s3", region_name=os.getenv("AWS_REGION") or os.getenv("AWS_DEFAULT_REGION"))
    obj = s3.get_object(Bucket=MODEL_BUCKET, Key=model_key(use_case))
    return json.loads(obj["Body"].read().decode("utf-8"))


def predict_from_model(model: dict[str, Any], payload: dict[str, Any], use_case: str) -> dict[str, Any]:
    params = model.get("params", {})

    if use_case == "demand_forecasting":
        weekday = int(payload.get("weekday", 2))
        demand = params.get("baseline_demand", 30) * (1.12 if weekday in (5, 6) else 0.96)
        return {"predicted_bookings": round(demand, 2)}

    if use_case == "recommendation":
        score = params.get("preference_weight", 2.0)
        return {
            "recommended_tours": [
                {"tour_id": "tour-2", "score": round(score, 3)},
                {"tour_id": "tour-4", "score": round(score * 0.93, 3)},
                {"tour_id": "tour-1", "score": round(score * 0.9, 3)},
            ]
        }

    if use_case == "cancellation_prediction":
        price = float(payload.get("price", 55.0))
        risk = min(0.95, params.get("risk_bias", 0.2) + (price / 500.0) * params.get("price_sensitivity", 0.25))
        return {"cancellation_risk": round(risk, 3)}

    current_price = float(payload.get("current_price", 60.0))
    new_price = current_price * (1 + params.get("elasticity", 0.05))
    return {"suggested_price": round(new_price, 2)}


@app.get("/health")
def health():
    return jsonify({"status": "ok"})


@app.post("/predict")
def predict():
    body = request.get_json(silent=True) or {}
    use_case = body.get("use_case", DEFAULT_USE_CASE)

    try:
        model = load_model(use_case)
        prediction = predict_from_model(model, body, use_case)
        return jsonify(
            {
                "use_case": use_case,
                "model_id": model.get("model_id"),
                "version": model.get("version"),
                "prediction": prediction,
            }
        )
    except Exception as exc:
        return jsonify({"error": str(exc), "use_case": use_case}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)
