#!/usr/bin/env python3
"""Promote model version by updating Kubernetes ConfigMap and release manifest."""

from __future__ import annotations

import argparse
import json
from pathlib import Path


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Promote model version into GitOps-tracked manifests")
    parser.add_argument("--latest-file", default="mlops/artifacts/models/tour-demand-forecast/latest.json")
    parser.add_argument("--configmap", default="configmap-ml-model.yaml")
    parser.add_argument("--s3-bucket", default="")
    parser.add_argument("--region", default="ap-southeast-1")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    latest_path = Path(args.latest_file)
    if not latest_path.exists():
        print(f"Latest model file not found: {latest_path}")
        return 1

    with latest_path.open("r", encoding="utf-8") as f:
        latest = json.load(f)

    model_name = latest["model_name"]
    version = latest["version"]

    s3_uri = ""
    if args.s3_bucket:
        s3_uri = f"s3://{args.s3_bucket}/ml/models/{model_name}/{version}/model.tar.gz"

    configmap = Path(args.configmap)
    configmap.write_text(
        "\n".join(
            [
                "apiVersion: v1",
                "kind: ConfigMap",
                "metadata:",
                "  name: ml-model-config",
                "  labels:",
                "    app.kubernetes.io/name: website-backend",
                "    app.kubernetes.io/part-of: mlops",
                "data:",
                f"  MODEL_NAME: \"{model_name}\"",
                f"  MODEL_VERSION: \"{version}\"",
                f"  MODEL_ARTIFACT_URI: \"{s3_uri}\"",
                f"  MODEL_REGION: \"{args.region}\"",
            ]
        )
        + "\n",
        encoding="utf-8",
    )

    release_manifest = Path("mlops/model_release.json")
    release_manifest.write_text(json.dumps(latest, indent=2), encoding="utf-8")

    print(f"Updated {configmap}")
    print(f"Wrote release manifest {release_manifest}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
