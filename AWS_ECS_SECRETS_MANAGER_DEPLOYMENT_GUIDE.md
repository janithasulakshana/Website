# AWS ECS Deployment Guide with Secrets Manager

This guide documents the end-to-end AWS deployment flow for this project using:

- Amazon ECR for container images
- Amazon ECS Fargate for frontend and backend services
- Application Load Balancer for traffic routing
- AWS CloudFormation for infrastructure automation
- AWS Secrets Manager for runtime JWT secret injection
- GitHub Actions for CI/CD

## Architecture Summary

The deployment path for this project is:

1. Build backend and frontend Docker images locally or in GitHub Actions.
2. Push images to Amazon ECR.
3. Store the JWT secret in AWS Secrets Manager.
4. Deploy the AWS infrastructure with CloudFormation.
5. Run frontend and backend as ECS Fargate services behind an ALB.
6. Inject `JWT_SECRET` into the backend container from Secrets Manager at runtime.

## Prerequisites

Before deploying, make sure you have:

- AWS CLI installed and authenticated
- Docker Desktop running
- Git installed
- GitHub CLI installed if you want to update GitHub Actions secrets from the terminal
- A valid AWS VPC and subnet IDs
- Permission to use ECR, ECS, CloudFormation, IAM, Logs, and Secrets Manager

## Files Involved

- `.github/workflows/deploy-website-aws.yml`
- `infra/aws/website-ecs-cloudformation.yaml`
- `Dockerfile.backend`
- `Dockerfile.frontend.prod`

## Step 1: Move to the project root

```powershell
Set-Location "c:\Users\kanishka\Desktop\github projects\Website"
```

Purpose:
Moves the shell into the repository root so all Docker and AWS commands run against the correct files.

## Step 2: Define deployment variables

```powershell
$AWS_REGION = "us-east-1"
$PROJECT_NAME = "website"
$ENVIRONMENT = "dev"
$STACK_NAME = "website-ecs-$ENVIRONMENT"
$ECR_BACKEND_REPOSITORY = "website-backend"
$ECR_FRONTEND_REPOSITORY = "website-frontend"

$AWS_VPC_ID = "vpc-xxxxxxxx"
$AWS_PUBLIC_SUBNET_A = "subnet-xxxxxxxx"
$AWS_PUBLIC_SUBNET_B = "subnet-yyyyyyyy"
$AWS_PRIVATE_SUBNET_A = "subnet-aaaaaaaa"
$AWS_PRIVATE_SUBNET_B = "subnet-bbbbbbbb"

$JWT_SECRET_VALUE = "replace-with-a-strong-random-secret-value"
$JWT_SECRET_NAME = "$PROJECT_NAME/$ENVIRONMENT/jwt"
```

Purpose:
Defines the values used by the deployment commands, including AWS network inputs, ECR repo names, and the JWT secret name.

## Step 3: Verify AWS authentication

```powershell
aws sts get-caller-identity
```

Purpose:
Confirms that the AWS CLI is authenticated and shows which AWS account and IAM identity will perform the deployment.

## Step 4: Create the JWT secret in AWS Secrets Manager

```powershell
aws secretsmanager create-secret `
  --name $JWT_SECRET_NAME `
  --description "JWT secret for $PROJECT_NAME $ENVIRONMENT" `
  --secret-string $JWT_SECRET_VALUE `
  --region $AWS_REGION
```

If the secret already exists, update it:

```powershell
aws secretsmanager put-secret-value `
  --secret-id $JWT_SECRET_NAME `
  --secret-string $JWT_SECRET_VALUE `
  --region $AWS_REGION
```

Purpose:
Creates or updates the runtime secret that ECS will inject into the backend container.

## Step 5: Capture the secret ARN

```powershell
$JWT_SECRET_ARN = aws secretsmanager describe-secret `
  --secret-id $JWT_SECRET_NAME `
  --query ARN `
  --output text `
  --region $AWS_REGION

$JWT_SECRET_ARN
```

Purpose:
Retrieves the exact ARN of the secret so CloudFormation and GitHub Actions can reference it.

## Step 6: Store the secret ARN in GitHub Actions

```powershell
gh secret set AWS_JWT_SECRET_ARN --body "$JWT_SECRET_ARN"
```

If you need to target a specific repository:

```powershell
gh secret set AWS_JWT_SECRET_ARN --repo <owner>/<repo> --body "$JWT_SECRET_ARN"
```

Purpose:
Stores the Secrets Manager ARN as a GitHub Actions secret so the deployment workflow can pass it into CloudFormation.

## Step 7: Verify required GitHub Actions secrets

```powershell
gh secret list
```

Required values include:

- `AWS_ROLE_TO_ASSUME`
- `AWS_VPC_ID`
- `AWS_PUBLIC_SUBNET_A`
- `AWS_PUBLIC_SUBNET_B`
- `AWS_PRIVATE_SUBNET_A` if private subnets are used
- `AWS_PRIVATE_SUBNET_B` if private subnets are used
- `AWS_JWT_SECRET_ARN`

Purpose:
Ensures the GitHub workflow has the AWS configuration it needs before a remote deployment is triggered.

## Step 8: Get the AWS account ID

```powershell
$ACCOUNT_ID = aws sts get-caller-identity --query Account --output text
$ACCOUNT_ID
```

Purpose:
Gets the AWS account ID so the full ECR image URIs can be constructed.

## Step 9: Ensure ECR repositories exist

```powershell
aws ecr describe-repositories --repository-names $ECR_BACKEND_REPOSITORY --region $AWS_REGION 2>$null
if ($LASTEXITCODE -ne 0) {
    aws ecr create-repository --repository-name $ECR_BACKEND_REPOSITORY --region $AWS_REGION
}

aws ecr describe-repositories --repository-names $ECR_FRONTEND_REPOSITORY --region $AWS_REGION 2>$null
if ($LASTEXITCODE -ne 0) {
    aws ecr create-repository --repository-name $ECR_FRONTEND_REPOSITORY --region $AWS_REGION
}
```

Purpose:
Checks whether the ECR repositories are already present and creates them if they are missing.

## Step 10: Log Docker in to ECR

```powershell
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin "$ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"
```

Purpose:
Authenticates Docker so it can push images into Amazon ECR.

## Step 11: Build versioned image tags

```powershell
$GIT_SHA = (git rev-parse --short HEAD).Trim()
$BACKEND_IMAGE_URI = "$ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_BACKEND_REPOSITORY:$GIT_SHA"
$FRONTEND_IMAGE_URI = "$ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_FRONTEND_REPOSITORY:$GIT_SHA"

$BACKEND_IMAGE_URI
$FRONTEND_IMAGE_URI
```

Purpose:
Generates image tags from the current commit so the deployment uses a traceable image version.

## Step 12: Build and push the backend image

```powershell
docker build --platform linux/amd64 -f Dockerfile.backend -t $BACKEND_IMAGE_URI .
docker push $BACKEND_IMAGE_URI
```

Purpose:
Builds the backend container image and pushes it to Amazon ECR.

## Step 13: Build and push the frontend image

```powershell
docker build --platform linux/amd64 -f Dockerfile.frontend.prod --build-arg VITE_API_BASE_URL=/api -t $FRONTEND_IMAGE_URI .
docker push $FRONTEND_IMAGE_URI
```

Purpose:
Builds the frontend production image and pushes it to Amazon ECR.

## Step 14: Validate the CloudFormation template

```powershell
aws cloudformation validate-template `
  --template-body file://infra/aws/website-ecs-cloudformation.yaml `
  --region $AWS_REGION
```

Purpose:
Checks the template syntax before a stack deployment starts.

## Step 15: Remove a failed stack if needed

```powershell
$STACK_STATUS = aws cloudformation describe-stacks `
  --stack-name $STACK_NAME `
  --region $AWS_REGION `
  --query "Stacks[0].StackStatus" `
  --output text 2>$null

$STACK_STATUS

if ($STACK_STATUS -in @("ROLLBACK_COMPLETE","ROLLBACK_FAILED","CREATE_FAILED","DELETE_FAILED","UPDATE_ROLLBACK_FAILED","UPDATE_ROLLBACK_COMPLETE")) {
    aws cloudformation delete-stack --stack-name $STACK_NAME --region $AWS_REGION
    aws cloudformation wait stack-delete-complete --stack-name $STACK_NAME --region $AWS_REGION
}
```

Purpose:
Deletes a broken CloudFormation stack so the next deployment starts cleanly.

## Step 16: Deploy the AWS stack manually

```powershell
aws cloudformation deploy `
  --stack-name $STACK_NAME `
  --template-file "infra/aws/website-ecs-cloudformation.yaml" `
  --capabilities CAPABILITY_NAMED_IAM `
  --region $AWS_REGION `
  --parameter-overrides `
    ProjectName="$PROJECT_NAME" `
    EnvironmentName="$ENVIRONMENT" `
    VpcId="$AWS_VPC_ID" `
    PublicSubnetA="$AWS_PUBLIC_SUBNET_A" `
    PublicSubnetB="$AWS_PUBLIC_SUBNET_B" `
    PrivateSubnetA="$AWS_PRIVATE_SUBNET_A" `
    PrivateSubnetB="$AWS_PRIVATE_SUBNET_B" `
    FrontendImageUri="$FRONTEND_IMAGE_URI" `
    BackendImageUri="$BACKEND_IMAGE_URI" `
    JwtSecretArn="$JWT_SECRET_ARN" `
    CorsOrigin="*"
```

Purpose:
Creates or updates the AWS infrastructure and deploys the current application images to ECS.

## Step 17: Review stack outputs

```powershell
aws cloudformation describe-stacks `
  --stack-name $STACK_NAME `
  --region $AWS_REGION `
  --query "Stacks[0].Outputs" `
  --output table
```

Purpose:
Displays the CloudFormation outputs, including the application URL and ECS service names.

## Step 18: Get the website URL

```powershell
aws cloudformation describe-stacks `
  --stack-name $STACK_NAME `
  --region $AWS_REGION `
  --query "Stacks[0].Outputs[?OutputKey=='WebsiteUrl'].OutputValue" `
  --output text
```

Purpose:
Returns the public ALB URL for the deployed application.

## Step 19: Check ECS services

```powershell
$CLUSTER_NAME = "$PROJECT_NAME-$ENVIRONMENT-cluster"

aws ecs list-services --cluster $CLUSTER_NAME --region $AWS_REGION

aws ecs describe-services `
  --cluster $CLUSTER_NAME `
  --services "$PROJECT_NAME-$ENVIRONMENT-frontend" "$PROJECT_NAME-$ENVIRONMENT-backend" `
  --region $AWS_REGION
```

Purpose:
Verifies whether the frontend and backend ECS services are stable after deployment.

## Step 20: Stream backend logs for troubleshooting

```powershell
aws logs tail "/ecs/$PROJECT_NAME/$ENVIRONMENT/backend" --since 30m --follow --region $AWS_REGION
```

Purpose:
Streams backend logs from CloudWatch to help diagnose startup or runtime issues.

## Trigger the GitHub Actions deployment instead of manual deployment

After the GitHub secrets are configured, you can use the workflow instead of running the manual CloudFormation deploy yourself.

```powershell
gh workflow run "Deploy Website to AWS ECS" --ref aws-hosting -f environment=dev
```

Purpose:
Triggers the repository's GitHub Actions workflow to build, push, and deploy using the same infrastructure path.

## Notes

- The deployment workflow now expects `AWS_JWT_SECRET_ARN` instead of the raw `JWT_SECRET` value.
- ECS injects `JWT_SECRET` into the backend container from AWS Secrets Manager.
- This project currently uses SQLite inside the backend container. That is acceptable for demo and learning purposes but is not durable production storage.

## Related Files

- [README.md](README.md)
- [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md)
- [PROJECT_DOCUMENTATION.md](PROJECT_DOCUMENTATION.md)
- [.github/workflows/deploy-website-aws.yml](.github/workflows/deploy-website-aws.yml)
- [infra/aws/website-ecs-cloudformation.yaml](infra/aws/website-ecs-cloudformation.yaml)