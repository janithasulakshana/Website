# Azure DevOps + GitOps Setup Guide

This document shows how to run the same GitOps process (CI/CD + ArgoCD) in Azure DevOps for this repository.

## 1. Overview

- Azure DevOps is used for CI and CD pipeline orchestration.
- Azure Container Registry (ACR) stores built images.
- AKS runs the application workloads.
- ArgoCD runs in AKS as GitOps reconciler (target state from repo manifests).

## 2. Azure resources

1. Create resource group:
```bash
az group create -n my-rg -l eastus2
```
2. Register required providers (required for AKS):
```bash
az provider register --namespace Microsoft.ContainerService --wait
az provider register --namespace Microsoft.Compute --wait
```
3. Check and increase quotas if needed (AKS requires compute cores):
```bash
az quota list --scope /subscriptions/$(az account show --query id -o tsv)/providers/Microsoft.Compute/locations/eastus2 --query "[?name.value=='cores'].{Name:name.value, Limit:properties.limit.value, Usage:properties.currentValue.value}" -o table
```
   If quota is insufficient, request increase at: https://aka.ms/ProdportalCRP/#blade/Microsoft_Azure_Capacity/UsageAndQuota.ReactView

4. Create ACR:
```bash
az acr create -n myacrname -g my-rg --sku Standard
```
5. Create AKS (use smaller node count if quota limited):
```bash
az aks create -n my-aks -g my-rg --node-count 1 --enable-managed-identity --generate-ssh-keys
az aks update -n my-aks -g my-rg --attach-acr myacrname
```
4. Install ArgoCD:
```bash
kubectl create ns argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```
5. (Optional) Install ArgoCD Image Updater.

## 3. Azure DevOps project setup

1. Create Azure DevOps project at https://dev.azure.com
2. Create service connections:
   - Azure Resource Manager (ARM) using `Automatic` or `Service principal (manual)`.
   - Docker registry for ACR.
3. Add repository branches and branch policies for `main`, `develop`.

## 3.5 Deployment Commands (Quick Start)

Run these commands in order to deploy the entire stack:

```bash
# 1. Set variables
export RESOURCE_GROUP="my-rg"
export REGION="eastus2"
export ACR_NAME="myacrname"
export AKS_NAME="my-aks"
export SUBSCRIPTION_ID=$(az account show --query id -o tsv)

# 2. Create resource group
az group create -n $RESOURCE_GROUP -l $REGION

# 3. Register providers
az provider register --namespace Microsoft.ContainerService --wait
az provider register --namespace Microsoft.Compute --wait

# 4. Create ACR
az acr create -n $ACR_NAME -g $RESOURCE_GROUP --sku Standard

# 5. Create AKS (single node to avoid quota issues)
az aks create -n $AKS_NAME -g $RESOURCE_GROUP --node-count 1 \
  --enable-managed-identity --generate-ssh-keys

# 6. Attach ACR to AKS
az aks update -n $AKS_NAME -g $RESOURCE_GROUP --attach-acr $ACR_NAME

# 7. Get AKS credentials
az aks get-credentials -n $AKS_NAME -g $RESOURCE_GROUP --overwrite-existing

# 8. Install ArgoCD
kubectl create ns argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# 9. Wait for ArgoCD to be ready
kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=argocd-server -n argocd --timeout=300s

# 10. Get ArgoCD password
ARGOCD_PASSWORD=$(kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d)
echo "ArgoCD password: $ARGOCD_PASSWORD"

# 11. Port forward to ArgoCD (run in separate terminal)
# kubectl port-forward svc/argocd-server -n argocd 8080:443

# 12. Login to ArgoCD
# argocd login localhost:8080 --insecure --username admin --password $ARGOCD_PASSWORD

# 13. Create ArgoCD application from repo
kubectl apply -f argocd-application.yaml

# 14. Verify deployment
kubectl get ns
kubectl get pods -n argocd
argocd app get website  # if ArgoCD CLI configured
```

**For Azure DevOps pipeline deployment:**
1. Push `azure-pipelines-ci.yml` and `azure-pipelines-cd.yml` to repo root
2. In Azure DevOps UI: Create → New Pipeline → Select repo
3. Configure service connections (ARM, ACR) in Project Settings
4. Run the pipeline manually first

## 3.7 Deploy Frontend & Backend Services

After AKS and ArgoCD are ready, deploy your services using the existing manifests:

```bash
# Option A: Direct kubectl apply (manual deployment)
kubectl apply -f deployment-backend.yaml
kubectl apply -f deployment-frontend.yaml
kubectl apply -f backend-service.yaml
kubectl apply -f frontend-service.yaml

# Verify deployments
kubectl get deployments
kubectl get pods
kubectl get svc

# Option B: Using ArgoCD (GitOps preferred)
# First, ensure your git repo has the manifests in /manifests folder
# Update your argocd-application.yaml to point to the repo path
kubectl apply -f argocd-application.yaml

# Check ArgoCD sync status
argocd app list
argocd app sync website  # if using ArgoCD CLI

# Watch deployment progress
kubectl get pods -A -w

# Option C: Port-forward to test services
kubectl port-forward svc/frontend-service 3000:80 &
kubectl port-forward svc/backend-service 5000:5000 &

# Then open browser to:
# Frontend: http://localhost:3000
# Backend: http://localhost:5000/health

# View logs
kubectl logs -f deployment/website-backend
kubectl logs -f deployment/website-frontend

# Scale services if needed
kubectl scale deployment/website-backend --replicas 3
kubectl scale deployment/website-frontend --replicas 2
```

**Recommended workflow:**
1. Commit manifests to `main` branch in repo
2. Create ArgoCD application pointing to repo
3. Push to trigger CI/CD pipeline
4. Pipeline updates image tags in manifests
5. ArgoCD detects changes and syncs automatically

## 4. Pipeline files

### 4.1 CI pipeline: `azure-pipelines-ci.yml`

#### Option A: Using pre-built images from Docker Hub (simplest, avoids Docker daemon issues)
```yaml
trigger:
  branches:
    include:
      - main
      - develop

pool:
  vmImage: ubuntu-latest

variables:
  ACR_NAME: myacrname
  IMAGE_BACKEND: $(ACR_NAME).azurecr.io/website-backend
  IMAGE_FRONTEND: $(ACR_NAME).azurecr.io/website-frontend

stages:
- stage: Import
  jobs:
  - job: PullAndPush
    steps:
    - checkout: self

    - task: Docker@2
      displayName: Pull and push backend image to ACR
      inputs:
        command: buildAndPush
        Dockerfile: 'Dockerfile'
        repository: $(IMAGE_BACKEND)
        tags: |
          $(Build.BuildId)
          latest
        containerRegistry: ACR-ServiceConnection

    - task: AzureCLI@2
      displayName: Verify image in ACR
      inputs:
        azureSubscription: 'AzureRM-Connection'
        scriptType: bash
        scriptLocation: inlineScript
        inlineScript: |
          az acr repository list -n $(ACR_NAME)
          az acr repository show-tags -n $(ACR_NAME) --repository website-backend
```

#### Option B: Build from Dockerfile (requires Docker daemon, or use Microsoft-hosted agent)
```yaml
trigger:
  branches:
    include:
      - main
      - develop

pool:
  vmImage: ubuntu-latest

variables:
  ACR_NAME: myacrname
  IMAGE_BACKEND: $(ACR_NAME).azurecr.io/website-backend
  IMAGE_FRONTEND: $(ACR_NAME).azurecr.io/website-frontend

stages:
- stage: Build
  jobs:
  - job: Build
    steps:
    - checkout: self
    - task: NodeTool@0
      inputs:
        versionSpec: '24.x'

    - script: |
        cd backend
        npm ci
      displayName: Install backend deps

    - script: |
        cd frontend
        npm ci
        npm run build
      displayName: Build frontend

    - task: Docker@2
      displayName: Build and push backend image
      inputs:
        command: buildAndPush
        repository: $(IMAGE_BACKEND)
        dockerfile: Dockerfile
        tags: |
          $(Build.BuildId)
          latest
        containerRegistry: ACR-ServiceConnection

    - task: Docker@2
      displayName: Build and push frontend image
      inputs:
        command: buildAndPush
        repository: $(IMAGE_FRONTEND)
        dockerfile: Dockerfile.frontend
        tags: |
          $(Build.BuildId)
          latest
        containerRegistry: ACR-ServiceConnection
```

**Recommendation**: Use **Option A** with pre-built images—avoids all Docker daemon permission issues.

### 4.2 CD pipeline: `azure-pipelines-cd.yml`

Use artifact trigger from CI and deploy via GitOps update:
```yaml
trigger: none
resources:
  pipelines:
    - pipeline: ci
      source: azure-pipelines-ci
      project: <yourProject>
      trigger: true

pool:
  vmImage: ubuntu-latest

stages:
- stage: GitOps
  jobs:
  - job: UpdateManifest
    steps:
    - checkout: self

    - task: Bash@3
      displayName: "Update deployment image tag in Git"
      inputs:
        targetType: 'inline'
        script: |
          export TAG=$(Build.BuildId)
          yq eval '.spec.template.spec.containers[0].image = "$(IMAGE_BACKEND):'$TAG'"' -i manifests/deployment-backend.yaml
          git config user.email "azuredevops@yourorg.com"
          git config user.name "Azure DevOps"
          git add manifests/deployment-backend.yaml
          git commit -m "GitOps: update backend image to $TAG"
          git push origin main

    - script: |
        echo 'Trigger ArgoCD sync via API or rely on auto-sync'
```

## 5. ArgoCD configuration

Your existing `argocd-application.yaml` already has recommended policies:
- `syncPolicy.automated.prune: true`
- `syncPolicy.automated.selfHeal: true`
- `syncPolicy.retry`

The `spec.source` points to repo path; ensure this is the same path the CD pipeline updates (`manifests/` or root).

## 6. Terraform + infra pipeline

Keep `infra/terraform` as is. In Azure DevOps pipeline:
- `terraform init` with backend (Storage Account)
- `terraform plan` and manual approval for `terraform apply`.

## 7. Security and identity

For Azure DevOps pipeline, use managed service connection and `AzureCLI@2`:
```yaml
- task: AzureCLI@2
  inputs:
    azureSubscription: 'AzureRM-Connection'
    scriptType: bash
    scriptLocation: inlineScript
    inlineScript: |
      az account show
```

## 8. Links for interview reference

- GitOps: ArgoCD uses repo as single source of truth with automated reconciliation.
- Azure DevOps: CI builds images, CD updates manifest.
- Kubernetes: worker nodes run pods; control plane schedules.

---

## 9. Troubleshooting

### Provider Registration Errors
- **Error**: `MissingSubscriptionRegistration` for `Microsoft.ContainerService`
- **Solution**: Run `az provider register --namespace Microsoft.ContainerService --wait`
- **Why**: Azure providers need explicit registration in some subscriptions

### Quota Exceeded Errors
- **Error**: `QuotaExceeded` for Total Regional Cores
- **Solution**: 
  1. Check current quota: `az quota list --scope /subscriptions/<sub-id>/providers/Microsoft.Compute/locations/<region>`
  2. Request increase via Azure Portal: https://aka.ms/ProdportalCRP
  3. Alternative: Use smaller VM sizes or fewer nodes
- **Why**: Free/trial subscriptions have low core limits (e.g., 10 cores)

### SSH Key Generation
- SSH keys are auto-generated in `~/.ssh/` on Cloud Shell
- For persistent storage, download keys or use existing ones
- Command: `az aks create --generate-ssh-keys` creates `id_rsa` and `id_rsa.pub`

### Docker Permission Denied on Self-Hosted Windows Agent
- **Error**: `permission denied while trying to connect to the docker API at npipe:////./pipe/docker_engine`
- **Cause**: Docker daemon is running, but the Azure DevOps agent service account lacks access
  - Docker Desktop runs under the logged-in user's context
  - Azure DevOps agent runs as different user (e.g., LocalSystem, NetworkService, or service account)
  - Service account can't access Docker pipes
- **Solutions** (pick one):
  1. **Run agent under Docker user** (simplest):
     - Stop the Azure DevOps agent: `net stop vstsagent.<org>.<pool>.<agent>`
     - In Services (`services.msc`), find agent → Properties → Log On tab → set to user running Docker Desktop
     - Restart agent: `net start vstsagent.<org>.<pool>.<agent>`
  2. **Add agent account to docker-users group**:
     ```powershell
     net localgroup docker-users <AgentServiceAccount> /add
     # Restart agent after this
     ```
  3. **Run Docker and agent as same user**:
     - Ensure Docker Desktop auto-starts with signed-in user
     - Run agent under that same user account
- **Verify fix**: In pipeline, `docker ps` should succeed

### Interview Notes on Azure Limits
- Resource quotas prevent runaway costs in shared environments
- Provider registration ensures feature availability
- Managed identity reduces credential management overhead

### Backend Pod Running Nginx Instead of Node.js
- **Issue**: Pod logs show nginx starting, but backend should be Node.js app on port 5000
- **Root Cause**: ArgoCD Image Updater is pulling `janithasulakshana/website-backend:1.0.0` which is nginx image, not your Node.js backend

#### Option 1: Fix by building correct Node.js image (Recommended)
```bash
# Build the correct backend image from your Dockerfile.backend
docker build -f Dockerfile.backend -t janithasulakshana/website-backend:1.0.0 .
docker login
docker push janithasulakshana/website-backend:1.0.0
```

#### Option 2: Proceed with nginx (if you want API served by nginx)
If you want to use nginx to serve your API instead of Node.js:

1. **Update nginx config** to serve your API endpoints:
```nginx
# nginx.conf for API serving
server {
    listen 5000;
    location /api/ {
        # Proxy to your actual backend or serve static API responses
        proxy_pass http://your-backend-service;
        # Or serve static JSON for /api/test
        location = /api/test {
            return 200 '{"status":"ok"}';
            add_header Content-Type application/json;
        }
    }
}
```

2. **Update Dockerfile** to use nginx with your config:
```dockerfile
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 5000
```

3. **Rebuild and push**:
```bash
docker build -f Dockerfile.backend -t janithasulakshana/website-backend:1.0.0 .
docker push janithasulakshana/website-backend:1.0.0
```

#### Option 3: Disable ArgoCD Image Updater temporarily
```bash
# Remove image updater annotations
kubectl annotate deployment/website-backend argocd-image-updater.argoproj.io/image-list-
kubectl annotate deployment/website-backend argocd-image-updater.argoproj.io/website-backend.image-spec-
kubectl annotate deployment/website-backend argocd-image-updater.argoproj.io/website-backend.update-strategy-

# Then manually update the image in deployment
kubectl set image deployment/website-backend backend=janithasulakshana/website-backend:correct-tag
```

**Current issue**: Liveness probe fails because nginx serves on port 80, but probes expect port 5000 `/api/test`.
