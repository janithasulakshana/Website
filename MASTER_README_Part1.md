# ArgoCD Automated Deployment & Image Drift Detection
## Complete Implementation Guide - Part 1/3

**Version:** 1.0 | **Status:** Production Ready

---

## 📋 Table of Contents

1. [Executive Summary](#executive-summary)
2. [Architecture Overview](#architecture-overview)
3. [How Image Drift Detection Works](#how-image-drift-detection-works)
4. [Complete Setup Instructions](#complete-setup-instructions)
5. [Configuration Reference](#configuration-reference)

---

## Executive Summary

This comprehensive package provides a **production-ready, fully automated Kubernetes deployment system** using ArgoCD with Image Drift Detection.

### Key Features

- **Automated Image Deployments**: New Docker images are automatically detected and deployed
- **Zero Manual Intervention**: Entire pipeline is automatic (push → build → deploy)
- **Zero Downtime Updates**: Rolling deployments with health checks
- **GitOps Workflow**: Git repository is the single source of truth
- **High Availability**: Multiple replicas, pod anti-affinity, health checks
- **Production Grade**: Security, monitoring, RBAC, multi-environment support
- **Complete Rollback**: Revert to any previous version instantly
- **Full Automation**: Scripts for setup, testing, monitoring, cleanup

### What You Get

- 6 production-ready configuration files
- 10 comprehensive documentation guides (155+ KB)
- 5 automation scripts (setup, testing, monitoring)
- Complete Kubernetes manifests
- GitHub Actions CI/CD workflow
- Multi-environment support (dev, staging, production)

---

## Architecture Overview

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     GITHUB REPOSITORY                        │
│  manifests/base/kustomization.yaml (image versions)         │
└─────────────────────────────────────────────────────────────┘
                     ▲                 ▼
         Image Updater (commits)  ArgoCD (syncs)
                     ▲                 ▼
┌─────────────────────────────────────────────────────────────┐
│                  KUBERNETES CLUSTER                          │
│  ArgoCD: server, controller, image-updater                  │
│  Application: backend, frontend, storage                    │
└─────────────────────────────────────────────────────────────┘
                     ▲
          Docker Registry (v1.0.1)
```

### Technology Stack

| Component | Purpose | Version |
|-----------|---------|---------|
| ArgoCD | GitOps & Deployment | v2.x |
| ArgoCD Image Updater | Drift Detection | v0.12.x |
| Kustomize | Config Management | v5.x |
| Kubernetes | Container Orchestration | v1.19+ |
| Docker | Container Runtime | 20.x+ |
| GitHub Actions | CI/CD Pipeline | Latest |

---

## How Image Drift Detection Works

### Definition: Image Drift

**Image Drift** = Mismatch between:
- **Git (Source of Truth)**: Image tag in `manifests/base/kustomization.yaml`
- **Cluster (Running State)**: Actual image running in Kubernetes pods
- **Registry**: Latest available image in Docker registry

### Complete Workflow Timeline

```
TIME    COMPONENT              ACTION
──────────────────────────────────────
T=0s    Developer             ✓ git push code
T=60s   GitHub Actions        ✓ Build & push image v1.0.1
T=120s  Image Updater         ✓ Detects new image
T=125s  Image Updater         ✓ Updates Git (drift!)
T=130s  ArgoCD                ✓ Detects Git change
T=135s  ArgoCD                ✓ Syncs to cluster
T=140s  Kubernetes            ✓ Rolling update starts
T=160s  Kubernetes            ✓ Old pods replaced
T=165s  Result                ✓ DEPLOYED (zero downtime)
```

### Update Strategies

**Development (Latest)**
```yaml
update-strategy: latest  # Any version OK
```

**Staging (Minor Compatible)**
```yaml
update-strategy: semver
semver-constraint: "^1.0"  # 1.x.x only
```

**Production (Patch Only)**
```yaml
update-strategy: semver
semver-constraint: "~1.0"  # 1.0.x only
```

---

## Complete Setup Instructions

### Prerequisites

**Software:**
- kubectl 1.19+
- git 2.x+
- docker 20.x+
- bash shell

**Access:**
- Kubernetes cluster with admin access
- GitHub account with repository access
- Docker registry access
- GitHub Personal Access Token

**Hardware:**
- Kubernetes: 2+ nodes recommended
- Memory: 4GB+ for ArgoCD
- CPU: 2+ cores
- Disk: 10GB+ for volumes

### Step 1: Create GitHub Token

```bash
# On GitHub:
1. Settings → Developer settings → Personal access tokens
2. Generate new token
3. Scopes: repo, read:packages
4. Copy token: ghp_xxxxxxxxxxxx
```

### Step 2: Prepare Git Repository

```bash
# Create structure
mkdir -p k8s-manifests/manifests/{base,overlays/{development,production}}
mkdir -p k8s-manifests/argocd/{applications,install}
mkdir -p k8s-manifests/.github/workflows

cd k8s-manifests

# Copy your manifests
cp path/to/*.yaml manifests/base/
cp manifests-base-kustomization.yaml manifests/base/kustomization.yaml
cp argocd-application.yaml argocd/applications/
cp argocd-image-updater.yaml argocd/install/
cp github-actions-build.yaml .github/workflows/build-and-push.yml
```

### Step 3: Update Configuration Files

**File 1: argocd-image-updater.yaml**
```bash
Find:    ghp_YOUR_GITHUB_TOKEN_HERE
Replace: ghp_<your-actual-token>

Find:    your-registry
Replace: docker.io or your-registry.com
```

**File 2: argocd-application.yaml**
```bash
Find:    https://github.com/your-org/k8s-manifests.git
Replace: <your-git-repo-url>

Find:    your-registry/backend
Replace: <your-image-path>
```

**File 3: manifests/base/kustomization.yaml**
```bash
Find:    your-registry
Replace: your-registry.com

Find:    v1.0.0
Replace: your-starting-version
```

### Step 4: Push to Git

```bash
git init
git add .
git commit -m "Initial: ArgoCD automated deployment"
git branch -M main
git remote add origin https://github.com/YOUR_ORG/k8s-manifests.git
git push -u origin main
```

### Step 5: Install ArgoCD

**Automated (Recommended):**
```bash
bash complete-deployment.sh
# Follow prompts, ~5 minutes
```

**Manual:**
```bash
# Create namespace
kubectl create namespace argocd

# Install ArgoCD
kubectl apply -n argocd -f \
  https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Wait for ready
kubectl wait --for=condition=ready pod \
  -l app.kubernetes.io/name=argocd-server \
  -n argocd --timeout=300s

# Get password
kubectl -n argocd get secret argocd-initial-admin-secret \
  -o jsonpath="{.data.password}" | base64 -d

# Create Git credentials
kubectl create secret generic git-credentials \
  --from-literal=git.token=ghp_xxxxxxxxxxxx \
  -n argocd
```

### Step 6: Deploy Image Updater

```bash
# Apply Image Updater
kubectl apply -f argocd-image-updater.yaml

# Verify
kubectl get pods -n argocd | grep image-updater

# Watch logs
kubectl logs -n argocd deployment/argocd-image-updater -f
```

### Step 7: Deploy Application

```bash
# Apply ArgoCD Application
kubectl apply -f argocd/applications/app.yaml

# Verify
kubectl get application -n argocd

# Check status
argocd app get letsgo-app
```

### Step 8: Verify Installation

```bash
# Run tests
bash test-argocd-setup.sh

# Manual checks:
kubectl get pods -n argocd
argocd app get letsgo-app
kubectl get deployment -n default
```

---

## Configuration Reference

### ArgoCD Application

**File: argocd-application.yaml**

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: letsgo-app
  namespace: argocd
  annotations:
    # Image update configuration
    argocd-image-updater.argoproj.io/image-list: \
      backend=your-registry/backend,frontend=your-registry/frontend
    
    # Write back to Git
    argocd-image-updater.argoproj.io/git-branch: main
    argocd-image-updater.argoproj.io/write-back-method: kustomize
    
    # Update strategy
    argocd-image-updater.argoproj.io/backend.update-strategy: semver
    argocd-image-updater.argoproj.io/backend.semver-constraint: "~1.0"

spec:
  project: default
  
  source:
    repoURL: https://github.com/your-org/k8s-manifests.git
    targetRevision: main
    path: manifests/base
    kustomize:
      version: v5.0.0
  
  destination:
    server: https://kubernetes.default.svc
    namespace: default
  
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
      - CreateNamespace=true
    retry:
      limit: 5
      backoff:
        duration: 5s
        factor: 2
        maxDuration: 3m
```

### Kustomization Configuration

**File: manifests/base/kustomization.yaml**

```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

namespace: default

resources:
  - backend-deployment.yaml
  - backend-service.yaml
  - frontend-deployment.yaml
  - frontend-service.yaml
  - configmap.yaml
  - secret.yaml
  - storage.yaml
  - ingress.yaml

# ⭐ CRITICAL: Image Updater modifies THIS
images:
  - name: backend
    newName: your-registry/backend
    newTag: v1.0.0  # ← Changed by Image Updater
  - name: frontend
    newName: your-registry/frontend
    newTag: v1.0.0  # ← Changed by Image Updater

commonLabels:
  app.kubernetes.io/managed-by: argocd
  app.kubernetes.io/instance: letsgo
```

---

**Continue to Part 2 for Operations, Monitoring, and Troubleshooting**
