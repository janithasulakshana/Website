# ArgoCD Directory Structure and Setup

## Complete Repository Structure

```
your-k8s-manifests-repo/
│
├── README.md
├── .gitignore
│
├── .github/
│   └── workflows/
│       ├── build-and-push.yml        # GitHub Actions: Build & push Docker images
│       └── validate.yml               # (Optional) Validate manifests
│
├── argocd/
│   ├── install/
│   │   ├── namespace.yaml             # ArgoCD namespace
│   │   ├── argocd-install.yaml        # (Optional) ArgoCD manifests
│   │   └── README.md                  # Installation instructions
│   │
│   ├── config/
│   │   ├── argocd-image-updater.yaml  # Image Updater deployment
│   │   ├── rbac.yaml                  # RBAC for Image Updater
│   │   └── secrets.yaml               # Git/Registry credentials
│   │
│   └── applications/
│       ├── app.yaml                   # Main ArgoCD Application resource
│       ├── dev-app.yaml               # Development environment app
│       └── prod-app.yaml              # Production environment app
│
├── manifests/
│   ├── base/                          # Base manifests (kustomize base)
│   │   ├── backend-deployment.yaml
│   │   ├── backend-service.yaml
│   │   ├── frontend-deployment.yaml
│   │   ├── frontend-service.yaml
│   │   ├── configmap.yaml
│   │   ├── secret.yaml
│   │   ├── storage.yaml
│   │   ├── ingress.yaml
│   │   └── kustomization.yaml         # ⭐ IMAGE VERSIONS MANAGED HERE
│   │
│   └── overlays/
│       ├── development/
│       │   ├── kustomization.yaml     # Dev overrides (1 replica, less memory)
│       │   └── config-patch.yaml
│       │
│       └── production/
│           ├── kustomization.yaml     # Prod overrides (3 replicas, more memory)
│           └── resource-patch.yaml
│
├── scripts/
│   ├── setup-argocd.sh                # Initial setup script
│   ├── update-images.sh               # Manual image update script
│   ├── check-drift.sh                 # Check for drift
│   └── cleanup.sh                     # Remove ArgoCD
│
└── docs/
    ├── ARGOCD_SETUP.md                # Setup instructions
    ├── IMAGE_UPDATE_WORKFLOW.md       # How image updates work
    └── TROUBLESHOOTING.md             # Common issues and solutions
```

## Step-by-Step Setup

### Step 1: Create Git Repository

```bash
# Create new repo on GitHub
git clone https://github.com/your-org/k8s-manifests.git
cd k8s-manifests

# Create directory structure
mkdir -p argocd/{install,config,applications}
mkdir -p manifests/{base,overlays/{development,production}}
mkdir -p scripts docs .github/workflows
```

### Step 2: Copy Your Kubernetes Manifests

```bash
# Copy your existing manifests to base directory
cp path/to/your/*-deployment.yaml manifests/base/
cp path/to/your/*-service.yaml manifests/base/
cp path/to/your/configmap.yaml manifests/base/
cp path/to/your/secret.yaml manifests/base/
cp path/to/your/storage.yaml manifests/base/
cp path/to/your/ingress.yaml manifests/base/
```

### Step 3: Create Kustomization

Copy `manifests-base-kustomization.yaml` to `manifests/base/kustomization.yaml`:

```bash
cp manifests-base-kustomization.yaml manifests/base/kustomization.yaml
```

**⭐ This is the KEY file. ArgoCD Image Updater modifies this to update image tags.**

### Step 4: Update Deployment Manifests

Your deployment manifests must use image names that match kustomization.yaml:

**backend-deployment.yaml:**
```yaml
containers:
- name: backend
  image: backend:latest    # ← Must match "name: backend" in kustomization
  # ... rest of spec
```

**frontend-deployment.yaml:**
```yaml
containers:
- name: frontend
  image: frontend:latest   # ← Must match "name: frontend" in kustomization
  # ... rest of spec
```

### Step 5: Update ArgoCD Application Manifest

Edit `argocd-application.yaml`:
- Change `repoURL: https://github.com/YOUR_ORG/k8s-manifests.git`
- Change image registry URLs in annotations
- Change `git.token` in Image Updater config

### Step 6: Push to Git

```bash
git add .
git commit -m "Initial commit: Kubernetes manifests with ArgoCD setup"
git branch -M main
git push -u origin main
```

### Step 7: Install ArgoCD

```bash
bash scripts/setup-argocd.sh
```

Or manually:

```bash
# Create namespace
kubectl create namespace argocd

# Install ArgoCD
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Wait for ready
kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=argocd-server -n argocd --timeout=300s

# Get admin password
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d

# Port forward
kubectl port-forward svc/argocd-server -n argocd 8080:443
```

Access: https://localhost:8080 (admin / password from above)

### Step 8: Install Image Updater

```bash
# Update Git token first!
# Edit argocd-image-updater.yaml and replace: ghp_YOUR_GITHUB_TOKEN_HERE

kubectl apply -f argocd-image-updater.yaml

# Verify installation
kubectl logs -n argocd deployment/argocd-image-updater -f
```

### Step 9: Deploy Application

```bash
# Apply ArgoCD Application manifest
kubectl apply -f argocd/applications/app.yaml

# Check status
kubectl get application -n argocd letsgo-app
argocd app get letsgo-app
```

### Step 10: Test Image Update Workflow

```bash
# Tag a new image
docker tag backend:latest your-registry/backend:v1.0.1
docker push your-registry/backend:v1.0.1

# Wait 2-3 minutes for Image Updater to detect
# Watch logs
kubectl logs -n argocd deployment/argocd-image-updater -f

# Check Git for new commit
# (Image Updater automatically commits the new tag)

# Check ArgoCD for sync
argocd app get letsgo-app --refresh
argocd app sync letsgo-app  # Trigger manual sync if auto-sync is slow
```

## Image Update Flow (Step by Step)

```
┌─────────────────────────────────────────────────────────────┐
│ T=0: Developer pushes new Docker image                       │
│ Command: docker push your-registry/backend:v1.0.1           │
└─────────────────────────────────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ T=10-60s: ArgoCD Image Updater polls registry                │
│ Finds: new tag v1.0.1 detected                              │
│ Action: Compares with kustomization.yaml (current: v1.0.0)  │
│ Result: Drift detected! ← IMAGE DRIFT                       │
└─────────────────────────────────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ T=70-90s: Image Updater updates Git                          │
│ File: manifests/base/kustomization.yaml                      │
│ Change: newTag: v1.0.0 → v1.0.1                             │
│ Action: Commits and pushes to main branch                    │
│ Commit: "auto: update backend image to v1.0.1"              │
└─────────────────────────────────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ T=100s: ArgoCD detects Git change                            │
│ Poll interval: ~3 seconds                                    │
│ Result: App status = OutOfSync                              │
│         (Git ≠ Cluster)                                      │
└─────────────────────────────────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ T=105s: ArgoCD auto-syncs (auto-sync enabled)                │
│ Action: Pulls latest manifests from Git                      │
│ Action: Applies to cluster                                   │
│ Result: New deployment spec with v1.0.1                      │
└─────────────────────────────────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ T=110-120s: Kubernetes pulls new image                       │
│ Action: Terminates old pod (v1.0.0)                          │
│ Action: Starts new pod (v1.0.1)                              │
│ Result: Rolling update → zero downtime!                      │
└─────────────────────────────────────────────────────────────┘
```

## How to Manually Update Images (Without Image Updater)

Sometimes you want to manually update without waiting for Image Updater:

```bash
# Edit manifests/base/kustomization.yaml
# Change: newTag: v1.0.0 → newTag: v1.0.1

git add manifests/base/kustomization.yaml
git commit -m "Update backend to v1.0.1"
git push

# ArgoCD detects change within 3 seconds and syncs automatically!
```

## Monitoring and Debugging

### Check Image Updater Logs

```bash
# Real-time logs
kubectl logs -n argocd deployment/argocd-image-updater -f

# Check if it's running
kubectl get pod -n argocd | grep image-updater

# Describe pod for errors
kubectl describe pod -n argocd -l app.kubernetes.io/name=argocd-image-updater
```

### Check ArgoCD Sync Status

```bash
# List all applications
argocd app list

# Check specific app
argocd app get letsgo-app

# Manual sync
argocd app sync letsgo-app

# View sync history
argocd app history letsgo-app

# Rollback to previous sync
argocd app rollback letsgo-app 0
```

### Check Git Commits

```bash
# Image Updater should have created commits
git log --oneline | head -10

# Example output:
# abc1234 auto: update backend image to v1.0.1
# def5678 Initial commit
```

## Drift Detection in Action

### What is Drift?

Drift = Difference between:
- **Git (Source of Truth)**: What's in manifests/base/kustomization.yaml
- **Cluster (Running State)**: What's actually running in Kubernetes

### Types of Drift

**Image Drift (What we're automating):**
```
Git says: backend:v1.0.1
Cluster has: backend:v1.0.0
Result: OutOfSync → ArgoCD syncs automatically
```

**Config Drift:**
```
Git says: 2 replicas
Cluster has: 1 replica (someone scaled down manually)
Result: OutOfSync → ArgoCD restores to 2 replicas
```

**Manual Changes (Prevented by selfHeal):**
```
Someone runs: kubectl set image deployment/backend backend=wrong:version
ArgoCD detects change (conflicts with Git)
ArgoCD restores from Git automatically (selfHeal=true)
```

## Environment-Specific Deployments

### Deploy Development

```bash
kubectl apply -f argocd/applications/dev-app.yaml
```

Edit `dev-app.yaml`:
```yaml
source:
  path: manifests/overlays/development
```

### Deploy Production

```bash
kubectl apply -f argocd/applications/prod-app.yaml
```

Edit `prod-app.yaml`:
```yaml
source:
  path: manifests/overlays/production
```

### Different Image Tags per Environment

**manifests/overlays/development/kustomization.yaml:**
```yaml
images:
  - name: backend
    newTag: dev-latest
```

**manifests/overlays/production/kustomization.yaml:**
```yaml
images:
  - name: backend
    newTag: v1.0.1
```

Now Image Updater can manage different tags for each environment!

## Production Checklist

- [ ] Git repository branch protection (require reviews before merge)
- [ ] GitHub token stored securely (never commit, use secrets)
- [ ] Image versioning strategy documented (semver recommended)
- [ ] Backup and restore procedure for persistent volumes
- [ ] Monitoring for ArgoCD health
- [ ] Monitoring for Image Updater health
- [ ] Slack/email notifications configured
- [ ] Rollback procedure tested and documented
- [ ] Git commit history preserved and backed up
- [ ] Testing environment matches production
- [ ] Load testing with new versions before production
- [ ] Gradual rollout strategy (canary/blue-green optional)
