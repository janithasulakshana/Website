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

1. Create Azure DevOps project.
2. Create service connections:
   - Azure Resource Manager (ARM) using `Automatic` or `Service principal (manual)`.
   - Docker registry for ACR.
3. Add repository branches and branch policies for `main`, `develop`.

## 4. Pipeline files

### 4.1 CI pipeline: `azure-pipelines-ci.yml`

Use this as base:
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

    - publish: $(Pipeline.Workspace)
      artifact: imageinfo
```

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

### Interview Notes on Azure Limits
- Resource quotas prevent runaway costs in shared environments
- Provider registration ensures feature availability
- Managed identity reduces credential management overhead
