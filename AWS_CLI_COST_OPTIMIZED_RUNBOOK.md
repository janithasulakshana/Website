# AWS CLI Runbook: Cost-Optimized Deployment + Splunk

This runbook deploys a cost-optimized target stack:
- Frontend: S3 + CloudFront
- Backend: ECS Fargate with Fargate Spot strategy
- Observability: CloudWatch + Splunk (filtered high-value logs)

Assumptions:
- AWS CLI v2 is installed and configured.
- Docker is installed for image build/push.
- You already have a Splunk HEC endpoint/token.

## 0) Set Environment Variables (PowerShell)

```powershell
$AWS_REGION="ap-south-1"
$ACCOUNT_ID=(aws sts get-caller-identity --query Account --output text)

$APP_NAME="website"
$ENV="prod"

$ECR_REPO="$APP_NAME-backend"
$ECS_CLUSTER="$APP_NAME-$ENV-cluster"
$ECS_SERVICE="$APP_NAME-$ENV-backend"
$TASK_FAMILY="$APP_NAME-$ENV-backend"

$S3_BUCKET="$APP_NAME-$ENV-frontend-$ACCOUNT_ID"
$CF_COMMENT="$APP_NAME-$ENV-cdn"

$SPLUNK_HEC_URL="https://http-inputs-your-stack.splunkcloud.com:8088"
$SPLUNK_HEC_TOKEN="replace-with-real-token"
$SPLUNK_INDEX="main"
```

## 1) Frontend: S3 Static Hosting + CloudFront

### 1.1 Create S3 bucket and harden settings

```powershell
aws s3api create-bucket --bucket $S3_BUCKET --region $AWS_REGION --create-bucket-configuration LocationConstraint=$AWS_REGION

aws s3api put-public-access-block --bucket $S3_BUCKET --public-access-block-configuration BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true

aws s3api put-bucket-versioning --bucket $S3_BUCKET --versioning-configuration Status=Enabled
```

### 1.2 Build frontend and upload artifacts

```powershell
cd frontend
npm ci
npm run build
cd ..

aws s3 sync ./frontend/dist s3://$S3_BUCKET --delete
```

### 1.3 Create CloudFront distribution (simple mode)

Save this as `cf-config.json`:

```json
{
  "CallerReference": "website-prod-001",
  "Comment": "website-prod-cdn",
  "Enabled": true,
  "Origins": {
    "Quantity": 1,
    "Items": [
      {
        "Id": "s3-origin",
        "DomainName": "REPLACE_BUCKET.s3.REPLACE_REGION.amazonaws.com",
        "S3OriginConfig": { "OriginAccessIdentity": "" }
      }
    ]
  },
  "DefaultCacheBehavior": {
    "TargetOriginId": "s3-origin",
    "ViewerProtocolPolicy": "redirect-to-https",
    "AllowedMethods": { "Quantity": 2, "Items": ["GET", "HEAD"], "CachedMethods": { "Quantity": 2, "Items": ["GET", "HEAD"] } },
    "Compress": true,
    "ForwardedValues": { "QueryString": false, "Cookies": { "Forward": "none" } },
    "MinTTL": 0
  },
  "PriceClass": "PriceClass_100"
}
```

Then:

```powershell
# Replace placeholders in cf-config.json first, then run:
aws cloudfront create-distribution --distribution-config file://cf-config.json
```

## 2) Backend: ECR + ECS Fargate (with Spot strategy)

### 2.1 Create ECR repository

```powershell
aws ecr describe-repositories --repository-names $ECR_REPO --region $AWS_REGION 2>$null
if ($LASTEXITCODE -ne 0) {
  aws ecr create-repository --repository-name $ECR_REPO --region $AWS_REGION | Out-Null
}
```

### 2.2 Build and push backend image

```powershell
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin "$ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"

$IMAGE_URI="$ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO:latest"

docker build -t $IMAGE_URI -f Dockerfile .
docker push $IMAGE_URI
```

### 2.3 Create ECS cluster

```powershell
aws ecs describe-clusters --clusters $ECS_CLUSTER --region $AWS_REGION --query "clusters[0].clusterName" --output text 2>$null
if ($LASTEXITCODE -ne 0) {
  aws ecs create-cluster --cluster-name $ECS_CLUSTER --region $AWS_REGION | Out-Null
}
```

### 2.4 Create IAM roles (execution + task)

Save trust policy as `ecs-trust.json`:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": { "Service": "ecs-tasks.amazonaws.com" },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

```powershell
aws iam create-role --role-name "$APP_NAME-ecs-execution-role" --assume-role-policy-document file://ecs-trust.json 2>$null
aws iam attach-role-policy --role-name "$APP_NAME-ecs-execution-role" --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy

aws iam create-role --role-name "$APP_NAME-ecs-task-role" --assume-role-policy-document file://ecs-trust.json 2>$null
```

### 2.5 Store Splunk values in Secrets Manager

```powershell
aws secretsmanager create-secret --name "$APP_NAME/$ENV/splunk_hec_url" --secret-string "$SPLUNK_HEC_URL" --region $AWS_REGION 2>$null
aws secretsmanager create-secret --name "$APP_NAME/$ENV/splunk_hec_token" --secret-string "$SPLUNK_HEC_TOKEN" --region $AWS_REGION 2>$null
```

### 2.6 Register task definition (cost-optimized size)

Save as `taskdef.json`:

```json
{
  "family": "website-prod-backend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "arn:aws:iam::REPLACE_ACCOUNT:role/website-ecs-execution-role",
  "taskRoleArn": "arn:aws:iam::REPLACE_ACCOUNT:role/website-ecs-task-role",
  "containerDefinitions": [
    {
      "name": "backend",
      "image": "REPLACE_IMAGE_URI",
      "essential": true,
      "portMappings": [{ "containerPort": 5000, "hostPort": 5000, "protocol": "tcp" }],
      "environment": [
        { "name": "NODE_ENV", "value": "production" },
        { "name": "PORT", "value": "5000" },
        { "name": "HOST", "value": "0.0.0.0" }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/website-prod-backend",
          "awslogs-region": "REPLACE_REGION",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

```powershell
aws logs create-log-group --log-group-name "/ecs/$APP_NAME-$ENV-backend" --region $AWS_REGION 2>$null

# Replace placeholders in taskdef.json first
aws ecs register-task-definition --cli-input-json file://taskdef.json --region $AWS_REGION
```

### 2.7 Create service using Fargate + Fargate Spot strategy

You need an existing VPC, private subnets, and security group. Then:

```powershell
$SUBNET_1="subnet-xxxx"
$SUBNET_2="subnet-yyyy"
$SG_ID="sg-zzzz"

aws ecs create-service `
  --cluster $ECS_CLUSTER `
  --service-name $ECS_SERVICE `
  --task-definition "$TASK_FAMILY" `
  --desired-count 1 `
  --launch-type FARGATE `
  --network-configuration "awsvpcConfiguration={subnets=[$SUBNET_1,$SUBNET_2],securityGroups=[$SG_ID],assignPublicIp=DISABLED}" `
  --capacity-provider-strategy capacityProvider=FARGATE,base=1,weight=1 capacityProvider=FARGATE_SPOT,weight=4 `
  --region $AWS_REGION
```

## 3) Splunk Ingestion Strategy (Cost-Aware)

Recommended split:
- CloudWatch retains all app logs (short retention: 7-14 days).
- Splunk ingests high-value logs only:
  - `level in (warn,error,fatal)`
  - auth/security events
  - deployment events

This is usually the biggest direct cost optimization.

## 4) CloudWatch Retention (reduce cost)

```powershell
aws logs put-retention-policy --log-group-name "/ecs/$APP_NAME-$ENV-backend" --retention-in-days 14 --region $AWS_REGION
```

## 5) Autoscaling Guardrails

```powershell
aws application-autoscaling register-scalable-target `
  --service-namespace ecs `
  --resource-id "service/$ECS_CLUSTER/$ECS_SERVICE" `
  --scalable-dimension ecs:service:DesiredCount `
  --min-capacity 1 --max-capacity 4 `
  --region $AWS_REGION
```

Use conservative max capacity and only increase after observing real load.

## 6) Useful Validation Commands

```powershell
aws ecs describe-services --cluster $ECS_CLUSTER --services $ECS_SERVICE --region $AWS_REGION --query "services[0].{status:status,running:runningCount,desired:desiredCount}"

aws logs tail "/ecs/$APP_NAME-$ENV-backend" --follow --region $AWS_REGION
```

## 7) Cost Checklist Before Go-Live

- [ ] Frontend on S3 + CloudFront (not containerized)
- [ ] Backend task size right-sized (`256/512` baseline)
- [ ] Fargate Spot weight enabled
- [ ] CloudWatch retention <= 14 days for high-volume logs
- [ ] Splunk ingestion filtered to high-value events only
- [ ] AWS Budgets alerts configured

## 8) Rollback Plan

1. Keep previous task definition revision.
2. Roll back ECS service to prior task revision.
3. Invalidate CloudFront cache if frontend rollback is needed.

```powershell
aws ecs update-service --cluster $ECS_CLUSTER --service $ECS_SERVICE --task-definition "$TASK_FAMILY:PREVIOUS_REV" --region $AWS_REGION
```

## 9) Security Notes

- Never hardcode Splunk token in task definition for production.
- Use Secrets Manager with IAM permissions scoped to service roles.
- Use TLS HEC endpoint only.
- Restrict security groups to least privilege.
