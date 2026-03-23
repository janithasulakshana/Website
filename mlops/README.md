# MLOps Hands-On Module

This folder adds practical MLOps workflows to the website project so you can demonstrate:

1. Model artifact versioning in S3 with immutable version folders.
2. Infrastructure-as-code patterns for IAM, S3, Lambda, and MWAA.
3. Extended DevOps workflows from data extraction to model promotion.

## Local Workflow

1. Extract bookings dataset:

```bash
python mlops/extract_bookings.py --db-path backend/bookings.db --output mlops/artifacts/datasets/bookings.csv
```

2. Train and package model:

```bash
python mlops/train_and_package.py --input mlops/artifacts/datasets/bookings.csv --model-name tour-demand-forecast
```

3. Promote latest model into GitOps config:

```bash
python mlops/promote_model_to_gitops.py --latest-file mlops/artifacts/models/tour-demand-forecast/latest.json --configmap configmap-ml-model.yaml --s3-bucket <your-bucket> --region ap-southeast-1
```

## CI Workflow

Use `.github/workflows/mlops-train-register.yml` to:

1. Extract and train model from booking data.
2. Apply MAE quality gate before promotion.
3. Upload artifacts to S3 under `ml/models/<model>/<version>/`.
4. Update latest pointer under `ml/latest/<model>.json`.
5. Commit promoted model metadata and Kubernetes model config.

## CloudFormation

Use `infra/cloudformation/mlops-foundation.yaml` as IaC baseline for:

1. S3 artifact and data buckets with versioning.
2. IAM roles for Lambda and MWAA.
3. Batch inference Lambda deployment.
4. MWAA environment scaffolding.

## Suggested Resume Evidence

Capture these after one successful run:

1. Screenshot of S3 model version folders and latest pointer.
2. Git commit showing `configmap-ml-model.yaml` model version update.
3. GitHub Actions run proving model gate and artifact publication.
4. CloudFormation stack outputs showing created IAM/S3/Lambda/MWAA resources.
