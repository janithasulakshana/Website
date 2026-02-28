# ArgoCD Image Drift Detection Implementation - Complete Summary

## What You're Getting

Complete automated deployment system where pushing a new Docker image automatically triggers deployment to Kubernetes.

### Files Created (11 total)

**Configuration Files:**
1. `argocd-application.yaml` - Main ArgoCD Application resource with image update config
2. `argocd-image-updater.yaml` - Image Updater deployment + RBAC + configuration
3. `manifests-base-kustomization.yaml` - Kustomize base (Image Updater modifies image tags here)
4. `kustomization-dev.yaml` - Development environment overrides (1 replica, less memory)
5. `kustomization-prod.yaml` - Production environment overrides (3 replicas, more memory)
6. `github-actions-build.yaml` - GitHub Actions workflow to build & push images

**Documentation:**
7. `ARGOCD_IMAGE_AUTOMATION_GUIDE.md` - Complete technical guide (how everything works)
8. `ARGOCD_SETUP_GUIDE.md` - Step-by-step setup instructions with directory structure
9. `IMAGE_DRIFT_DETECTION_EXPLAINED.md` - Detailed explanation of drift detection mechanism
10. `ARGOCD_TROUBLESHOOTING.md` - Common issues and solutions
11. `ARGOCD_QUICK_REFERENCE.md` - Cheat sheet with commands and concepts

**Scripts:**
12. `argocd-setup.sh` - Automated setup script (Linux/Mac)

---

## How Image Drift Detection Works

### The Flow (Step by Step)

```
1. DEVELOPER PUSHES CODE
   └─ git commit && git push

2. GITHUB ACTIONS BUILDS CONTAINER
   └─ Builds image, tags as v1.0.1, pushes to registry

3. ARGOCD IMAGE UPDATER POLLS REGISTRY (every 2 minutes)
   └─ Detects: new image v1.0.1 in registry
   └─ Compares: Git has v1.0.0, Registry has v1.0.1
   └─ DRIFT DETECTED!

4. IMAGE UPDATER UPDATES GIT
   └─ Edits: manifests/base/kustomization.yaml
   └─ Changes: newTag: v1.0.0 → v1.0.1
   └─ Commits and pushes to Git

5. ARGOCD DETECTS GIT CHANGE (every 3 seconds)
   └─ Sees commit from Image Updater
   └─ Compares: Git has v1.0.1, Cluster has v1.0.0
   └─ AUTO-SYNCS because syncPolicy.automated is enabled

6. KUBERNETES DEPLOYS NEW VERSION
   └─ Rolling update starts
   └─ Old pod with v1.0.0 terminates
   └─ New pod with v1.0.1 starts
   └─ Zero downtime!

7. MONITORING & VERIFICATION
   └─ All pods running v1.0.1 ✓
   └─ ArgoCD shows "Synced" ✓
   └─ Git history shows auto-update commit ✓
```

---

## Key Concepts

### Image Drift

**What is it?**
- Drift = Mismatch between what's in Git vs what's running in the cluster
- Git says: `backend:v1.0.1`
- Cluster has: `backend:v1.0.0`
- Result: Drift detected → ArgoCD auto-fixes

**Why it matters:**
- Ensures Git is always source of truth
- Prevents manual changes from diverging
- Enables automatic deployments

### Source of Truth

**Git repository (manifests/base/kustomization.yaml)**
- This is the definitive version of everything
- ArgoCD watches for changes here
- Any drift from this state is corrected

```yaml
images:
  - name: backend
    newName: your-registry/backend
    newTag: v1.0.1  ← This is updated by Image Updater
```

### Update Strategies

**Semantic Versioning (Recommended for Production)**
```yaml
argocd-image-updater.argoproj.io/backend.update-strategy: semver
argocd-image-updater.argoproj.io/backend.semver-constraint: "~1.0"
# Only updates 1.0.x versions (patch updates)
# Blocks 1.1.0, 2.0.0 (breaking changes)
```

**Latest Tag (For Development)**
```yaml
argocd-image-updater.argoproj.io/backend.update-strategy: latest
# Always update to newest available
```

---

## Setup Timeline

### Quick Setup (15 minutes)

```bash
# 1. Install ArgoCD (3 min)
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# 2. Create Git repository with manifests (5 min)
# Copy files to Git repo structure:
# manifests/base/*.yaml
# manifests/base/kustomization.yaml
git push

# 3. Install Image Updater (2 min)
# Update Git token in argocd-image-updater.yaml
kubectl apply -f argocd-image-updater.yaml

# 4. Deploy Application (2 min)
kubectl apply -f argocd-application.yaml

# 5. Test (3 min)
# Push new image and verify automatic deployment
```

### Detailed Setup

Read: `ARGOCD_SETUP_GUIDE.md`

---

## Directory Structure Required

```
your-git-repo/
├── manifests/
│   ├── base/
│   │   ├── backend-deployment.yaml
│   │   ├── frontend-deployment.yaml
│   │   ├── configmap.yaml
│   │   ├── secret.yaml
│   │   ├── storage.yaml
│   │   ├── ingress.yaml
│   │   └── kustomization.yaml         ← IMAGE VERSIONS HERE
│   └── overlays/
│       ├── development/
│       │   └── kustomization.yaml
│       └── production/
│           └── kustomization.yaml
│
├── argocd/
│   ├── applications/
│   │   └── app.yaml                    ← ArgoCD Application
│   └── install/
│       └── image-updater.yaml          ← Image Updater
│
└── .github/workflows/
    └── build-and-push.yml             ← Build images & push
```

---

## What Gets Updated Automatically

### Image Updater Updates (Git)
```
manifests/base/kustomization.yaml:
  images:
    - name: backend
      newTag: v1.0.0 → v1.0.1  ← Automatically updated
    - name: frontend
      newTag: v1.5.0 → v1.5.1  ← Automatically updated
```

### ArgoCD Syncs (Cluster)
```
deployment/backend:
  spec:
    template:
      spec:
        containers:
          - image: backend:v1.0.1  ← Updated from Git
deployment/frontend:
  spec:
    template:
      spec:
        containers:
          - image: frontend:v1.5.1  ← Updated from Git
```

---

## What Does NOT Get Updated

**Manual Images in Git** (without Image Updater)
- Edit kustomization.yaml manually
- Commit and push to Git
- ArgoCD detects and deploys

**Manifest Changes** (not image-related)
- Config changes
- Resource limits
- Replica count changes
- All go through Git → ArgoCD sync

**Operational Changes Without Git** (prevented!)
- `kubectl set image` commands are overridden by ArgoCD
- Direct deployment edits are reverted
- ArgoCD enforces Git state (selfHeal=true)

---

## Update Path Comparison

### Before ArgoCD

```
1. Developer commits code
2. GitHub Actions builds image
3. Someone manually updates deployment.yaml
4. Someone runs: kubectl apply -f deployment.yaml
5. Pods update
Problem: Manual steps, easy to forget, error-prone
```

### With ArgoCD + Image Updater

```
1. Developer commits code
2. GitHub Actions builds image (automatic from CI)
3. Image Updater detects and updates Git (automatic)
4. ArgoCD detects and deploys (automatic)
5. Pods update (automatic)
Result: Fully automated! No manual steps! ✓
```

---

## Commands to Know

### Check Status
```bash
argocd app get letsgo-app              # Application status
kubectl logs -n argocd deployment/argocd-image-updater -f  # Image Updater logs
git log --oneline | head -10            # Auto-update commits
```

### Manual Intervention
```bash
argocd app sync letsgo-app              # Force sync now
kubectl rollout restart deployment/backend  # Restart pods
argocd app rollback letsgo-app 0        # Rollback to previous version
```

### Debugging
```bash
kubectl describe application -n argocd letsgo-app
kubectl exec -it -n argocd <image-updater-pod> -- bash
kubectl get events -n argocd
```

---

## Configuration You Need to Update

### 1. argocd-image-updater.yaml
- Replace: `ghp_YOUR_GITHUB_TOKEN_HERE` with actual GitHub token
- Replace: `your-registry` with your Docker registry
- Replace: `your-registry-username` / `your-registry-password` (if private registry)

### 2. argocd-application.yaml
- Replace: `https://github.com/your-org/k8s-manifests.git` with your Git repo
- Replace: `your-registry/backend` with your image names
- Adjust update strategies (semver vs latest)

### 3. manifests-base-kustomization.yaml
- Replace: `your-registry/backend` with your registry
- Replace: `your-registry/frontend` with your registry
- Update `v1.0.0` version tags if needed

### 4. github-actions-build.yaml
- Replace: `your-registry` with your registry
- Replace: `REGISTRY_USERNAME` / `REGISTRY_PASSWORD` secrets
- Adjust image tag generation if needed

---

## Production Recommendations

### Image Versioning Strategy
```
Development:  backend:dev-latest (updates daily)
Staging:      backend:staging-latest (updates on release candidate)
Production:   backend:v1.0.0 (semver only, controlled updates)
```

### Update Constraints
```
Production:   Allow patch updates only (~1.0)
Staging:      Allow minor updates (^1.0)
Development:  Allow all updates
```

### Monitoring Setup
```
Monitor these:
- ArgoCD application sync status
- Image Updater pod health
- Git commit frequency (should be rare)
- Pod restart count (should be minimal)
```

---

## Troubleshooting Quick Reference

| Problem | Solution |
|---------|----------|
| Image Updater not detecting images | Check Git token, verify Application annotations |
| Git not being updated | Ensure Git token has write access |
| ArgoCD not syncing | Enable auto-sync (syncPolicy.automated.selfHeal: true) |
| Too many commits | Increase poll interval (registries.poll-interval: 5m) |
| Pod still has old image | Force restart: `kubectl rollout restart deployment/backend` |

Full guide: `ARGOCD_TROUBLESHOOTING.md`

---

## Next Steps

### Step 1: Read the Documentation
- Start with `ARGOCD_QUICK_REFERENCE.md` for overview
- Read `ARGOCD_SETUP_GUIDE.md` for detailed setup
- Understand concepts in `IMAGE_DRIFT_DETECTION_EXPLAINED.md`

### Step 2: Prepare Git Repository
- Create new repo (or use existing)
- Set up directory structure
- Copy Kubernetes manifests to manifests/base/

### Step 3: Configure Files
- Update Git repository URLs
- Update image registry names
- Add GitHub token to Image Updater

### Step 4: Install Components
```bash
bash argocd-setup.sh  # Or manual steps from SETUP_GUIDE.md
```

### Step 5: Test End-to-End
```bash
# 1. Push new image
docker tag backend:latest your-registry/backend:v1.0.1
docker push your-registry/backend:v1.0.1

# 2. Monitor Image Updater
kubectl logs -n argocd deployment/argocd-image-updater -f

# 3. Check Git for auto-update commit
git log --oneline | head -5

# 4. Monitor ArgoCD sync
argocd app get letsgo-app --refresh

# 5. Verify pods updated
kubectl get pods -w
```

---

## File Reference

| File | Purpose |
|------|---------|
| `ARGOCD_IMAGE_AUTOMATION_GUIDE.md` | Complete technical reference |
| `ARGOCD_SETUP_GUIDE.md` | Step-by-step setup instructions |
| `IMAGE_DRIFT_DETECTION_EXPLAINED.md` | How drift detection works |
| `ARGOCD_TROUBLESHOOTING.md` | Common issues & solutions |
| `ARGOCD_QUICK_REFERENCE.md` | Commands & concepts cheat sheet |
| `argocd-application.yaml` | ArgoCD Application manifest |
| `argocd-image-updater.yaml` | Image Updater deployment |
| `manifests-base-kustomization.yaml` | Kustomize configuration |
| `kustomization-dev.yaml` | Dev environment overrides |
| `kustomization-prod.yaml` | Prod environment overrides |
| `github-actions-build.yaml` | CI/CD workflow |
| `argocd-setup.sh` | Automated setup script |

---

## Success Metrics

When everything works correctly, you'll see:

✓ Push new image to registry
✓ 2-3 minutes later: Image Updater commits new tag to Git
✓ 5-10 seconds after that: ArgoCD syncs and deploys
✓ Pods automatically restart with new image
✓ Zero downtime during update
✓ Rollback possible by reverting Git commit
✓ Full audit trail in Git history

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────────┐
│                   GITHUB REPOSITORY                       │
│  ┌────────────────────────────────────────────────────────┤
│  │ manifests/base/kustomization.yaml (newTag: v1.0.1)   │
│  └────────────────────────────────────────────────────────┤
│                    ▲                 ▼
│         Image Updater        ArgoCD (polls)
│           (commits)           (syncs)
│                    ▲                 ▼
├────────────────────┼─────────────────┼─────────────────┐
│                    │                 │                 │
│          ARGOCD IMAGE UPDATER    ARGOCD SERVER    ARGOCD CONTROLLER
│          (watches registry)    (detects drift)   (applies to cluster)
│                    │                 │                 │
└────────────────────┼─────────────────┼─────────────────┘
                     ▼                 ▼
         ┌──────────────────┐  ┌──────────────────┐
         │  Docker Registry │  │  KUBERNETES      │
         │  (your-registry) │  │  CLUSTER         │
         │  backend:v1.0.1  │  │  (pods running   │
         │  frontend:v1.5.1 │  │   v1.0.1, v1.5.1)│
         └──────────────────┘  └──────────────────┘
```

---

## Support & Resources

- ArgoCD Docs: https://argo-cd.readthedocs.io/
- Image Updater Docs: https://argocd-image-updater.readthedocs.io/
- Kustomize Docs: https://kustomize.io/
- Docker Building: https://docs.docker.com/build/
- Kubernetes: https://kubernetes.io/docs/
