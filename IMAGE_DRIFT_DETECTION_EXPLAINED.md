# ArgoCD Image Drift Detection Workflow

## What is Image Drift?

**Image Drift** = The state where the running container image in your Kubernetes cluster
does NOT match the image tag defined in your Git repository.

ArgoCD uses this drift to trigger automatic deployments.

## Complete Workflow Diagram

```
DEVELOPER WORKFLOW
══════════════════════════════════════════════════════════════════

1. CODE CHANGE
   ├─ Developer commits code to main branch
   └─ GitHub Actions workflow triggered (build-and-push.yml)

2. CI/CD BUILD & PUSH
   ├─ GitHub Actions builds Docker image
   ├─ Tags image: your-registry/backend:v1.0.1
   ├─ Pushes to registry (Docker Hub, ECR, etc.)
   └─ Build complete


ARGOCD IMAGE UPDATER WORKFLOW
══════════════════════════════════════════════════════════════════

3. REGISTRY POLLING (Every 2 minutes by default)
   ├─ Image Updater runs in argocd namespace
   ├─ Connects to your-registry/backend (polls API)
   ├─ Finds new tag: v1.0.1
   ├─ Compares with Git: manifests/base/kustomization.yaml
   │  Current in Git:  newTag: v1.0.0
   │  New in registry: v1.0.1
   └─ ⭐ DRIFT DETECTED!

4. GIT REPOSITORY UPDATE
   ├─ Image Updater clones Git repository
   ├─ Updates: manifests/base/kustomization.yaml
   │  OLD: newTag: v1.0.0
   │  NEW: newTag: v1.0.1
   ├─ Commits: "auto: update backend image to v1.0.1"
   ├─ Pushes to main branch
   └─ ✓ Git is now source of truth with v1.0.1


ARGOCD APPLICATION SYNC
══════════════════════════════════════════════════════════════════

5. DETECT GIT CHANGE (Every 3 seconds by default)
   ├─ ArgoCD polls Git repository
   ├─ Detects new commit from Image Updater
   ├─ Compares Git vs running cluster
   │  Git has:     manifests with backend:v1.0.1
   │  Cluster has: deployment with backend:v1.0.0
   └─ ⭐ OUT OF SYNC! (drift detected)

6. AUTOMATIC SYNC (if auto-sync enabled)
   ├─ ArgoCD fetches updated manifests from Git
   ├─ Applies to Kubernetes cluster
   ├─ Updates deployment spec
   └─ Status: Syncing → Synced

7. KUBERNETES UPDATE
   ├─ Deployment controller detects change
   ├─ Triggers rolling update:
   │  a) Starts new pod with backend:v1.0.1
   │  b) Waits for pod readiness
   │  c) Adds to load balancer
   │  d) Removes old pod
   ├─ Repeat for all replicas
   └─ ✓ Deployment complete (zero downtime!)

8. CONVERGENCE
   ├─ Running cluster state now matches Git
   ├─ ArgoCD status: Synced ✓
   ├─ No drift detected
   └─ Application running v1.0.1


MONITORING & VERIFICATION
══════════════════════════════════════════════════════════════════

✓ All containers running new version
✓ Git repository has updated manifests
✓ ArgoCD shows "Synced" status
✓ Application is available
```

## How Drift Detection Prevents Manual Changes

### Scenario: Manual Cluster Change

```
STEP 1: Someone manually changes image
────────────────────────────────────
$ kubectl set image deployment/backend backend=wrong-image:v99

Cluster now has: wrong-image:v99
Git still has:   backend:v1.0.1

⭐ DRIFT DETECTED!

STEP 2: ArgoCD detects drift
────────────────────────────────────
The cluster state doesn't match Git (selfHeal=true)

STEP 3: ArgoCD auto-corrects
────────────────────────────────────
ArgoCD automatically restores the deployment from Git
Cluster goes back to: backend:v1.0.1

Result: Manual changes are prevented! ✓
Git is the source of truth!
```

## Multi-Environment Drift Detection

### Dev Environment

```
Git:     manifests/overlays/development/kustomization.yaml
         newTag: dev-latest

Registry: dev-latest → v1.0.1-rc.1 (release candidate)

Image Updater: "dev-latest changed to v1.0.1-rc.1, updating..."
Git Commit:    "auto: update dev backend to v1.0.1-rc.1"

Result: Dev environment gets latest release candidate ✓
```

### Production Environment

```
Git:     manifests/overlays/production/kustomization.yaml
         newTag: v1.0.0

Registry: v1.0.0 (stable), v1.0.1 (new)

Image Updater strategy: semver ~1.0
Allows: 1.0.1 (compatible with ~1.0)
Blocks: 2.0.0 (breaking change)

Image Updater: "v1.0.1 detected, compatible update allowed"
Git Commit:    "auto: update prod backend to v1.0.1"

Result: Production safely updated to compatible version ✓
```

## Drift Detection Timeline

```
T=0s     Developer commits code
T=5s     GitHub Actions starts
T=60s    Docker images built and pushed
T=120s   Image Updater polls registry (first poll)
T=125s   Image Updater detects new image
T=130s   Image Updater updates Git
T=133s   ArgoCD polls Git (detects change)
T=135s   ArgoCD syncs new image
T=140s   Kubernetes pulls new image and starts pod
T=160s   Old pod terminates
T=165s   NEW VERSION LIVE! ✓

Total time: ~2.75 minutes (can be optimized)
```

## Configuration Points for Drift Detection

### 1. Image Updater Poll Interval

```yaml
# In argocd-image-updater configmap
data:
  registries.poll-interval: "2m"  # Check registry every 2 minutes
```

Lower = faster detection, but more registry API calls

### 2. ArgoCD Git Poll Interval

```yaml
# In argocd Application spec
spec:
  source:
    repoURL: https://github.com/...

# Default: 3 second polling
# Configure via ArgoCD server args:
# --repo-server-strict-tls=false
# --app-resync=180s  # Resync every 3 minutes (fallback)
```

Lower = faster sync, but more Git API calls

### 3. Update Strategy

```yaml
# Different detection strategies
annotations:
  # Strategy 1: Auto-update to latest
  argocd-image-updater.argoproj.io/backend.update-strategy: latest
  
  # Strategy 2: Semantic versioning (safe for prod)
  argocd-image-updater.argoproj.io/backend.update-strategy: semver
  argocd-image-updater.argoproj.io/backend.semver-constraint: "~1.0"
  
  # Strategy 3: Manual only (never auto-detect)
  argocd-image-updater.argoproj.io/backend.update-strategy: none
```

### 4. Tag Filtering

```yaml
annotations:
  # Only detect stable releases
  argocd-image-updater.argoproj.io/backend.allow-tags: regexp:^v[0-9]+\.[0-9]+\.[0-9]+$
  
  # Exclude prerelease
  argocd-image-updater.argoproj.io/backend.ignore-tags: regex:.*-rc.*
```

## Drift Detection Examples

### Example 1: Simple Version Bump

```yaml
# Before: manifests/base/kustomization.yaml
images:
  - name: backend
    newTag: v1.0.0

# Registry has: v1.0.1

# Image Updater detects drift → updates Git
# After:
images:
  - name: backend
    newTag: v1.0.1  ← Changed by Image Updater
```

### Example 2: Multiple Services

```yaml
# Before:
images:
  - name: backend
    newTag: v1.0.0
  - name: frontend
    newTag: v2.5.0

# Registry has: backend:v1.0.1, frontend:v2.6.0

# Image Updater detects drift → updates BOTH
# After:
images:
  - name: backend
    newTag: v1.0.1  ← Updated
  - name: frontend
    newTag: v2.6.0  ← Updated
```

### Example 3: Semantic Version Constraint

```yaml
# Application config:
annotations:
  argocd-image-updater.argoproj.io/backend.semver-constraint: "~1.0"

# Before: newTag: v1.0.5
# Registry has: v1.0.6, v1.1.0, v2.0.0

# ~1.0 means: accept 1.0.x only (patch version updates)
# Image Updater will: Update to v1.0.6
# Image Updater will: REJECT v1.1.0 (minor version)
# Image Updater will: REJECT v2.0.0 (major version)

# After: newTag: v1.0.6  ← Safe update
```

## Drift Detection with GitOps Principles

### Key Principles

```
1. GIT IS SOURCE OF TRUTH
   └─ manifests/base/kustomization.yaml is definitive

2. AUTOMATIC DRIFT CORRECTION
   └─ If cluster differs from Git, ArgoCD fixes it

3. DECLARATIVE INFRASTRUCTURE
   └─ Push code → auto-deploy (no manual kubectl commands)

4. AUDIT TRAIL
   └─ Every change tracked in Git history

5. ROLLBACK ON DEMAND
   └─ Revert Git commit to rollback
```

## Preventing False Positives

### What NOT to do (causes false drift)

❌ Manual kubectl commands
❌ Directly editing ConfigMaps
❌ Scaling pods manually
❌ Committing image tags without testing

### What TO do (correct workflow)

✓ Update manifests → commit to Git
✓ Image Updater updates automatically
✓ ArgoCD detects Git change → syncs
✓ Everything tracked in Git history

## Disable Drift Detection (When Needed)

```yaml
# Make manual changes persistent:
spec:
  syncPolicy:
    automated:
      selfHeal: false  # Don't auto-correct drift
      prune: false     # Don't delete orphaned resources
```

This allows manual changes but loses GitOps benefits.
Not recommended for production!
