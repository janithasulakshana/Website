# ArgoCD Image Drift Detection - Quick Reference

## 30-Second Overview

**What?** ArgoCD automatically deploys new Docker images when they appear in your registry.

**How?**
1. Push new Docker image (tagged v1.0.1)
2. ArgoCD Image Updater detects it
3. Updates Git repository with new tag
4. ArgoCD sees Git changed
5. Automatically deploys new version

**Time:** 2-3 minutes from push to live

---

## Installation (5 minutes)

```bash
# Install ArgoCD
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Wait for ready
kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=argocd-server -n argocd --timeout=300s

# Get password
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d

# Port forward
kubectl port-forward svc/argocd-server -n argocd 8080:443

# Access: https://localhost:8080 (admin / password above)

# Install Image Updater
kubectl apply -f argocd-image-updater.yaml

# Deploy Application
kubectl apply -f argocd-application.yaml
```

---

## File Structure

```
repo/
├── manifests/base/
│   ├── backend-deployment.yaml
│   ├── kustomization.yaml         ← Image Updater modifies this
│   └── ...
├── argocd/
│   ├── applications/
│   │   └── app.yaml               ← Points to manifests/base
│   └── install/
│       └── image-updater.yaml
└── .github/workflows/
    └── build-and-push.yml         ← Builds and pushes images
```

---

## Configuration Files

### 1. kustomization.yaml (Image source of truth)

```yaml
images:
  - name: backend
    newName: your-registry/backend
    newTag: v1.0.0  ← Image Updater changes this
```

### 2. argocd-application.yaml (Tells ArgoCD what to watch)

```yaml
metadata:
  annotations:
    argocd-image-updater.argoproj.io/image-list: backend=your-registry/backend
    argocd-image-updater.argoproj.io/backend.update-strategy: semver
    argocd-image-updater.argoproj.io/git-branch: main

spec:
  syncPolicy:
    automated:
      selfHeal: true  ← Auto-deploy on Git change
```

### 3. argocd-image-updater.yaml (Watches registry)

```yaml
env:
  - name: GIT_TOKEN
    valueFrom:
      secretKeyRef:
        name: git-credentials
```

---

## Commands

### Check Status

```bash
# Application status
argocd app get letsgo-app

# Image Updater logs
kubectl logs -n argocd deployment/argocd-image-updater -f

# Git commits (should see auto-updates)
git log --oneline | head -10
```

### Manual Actions

```bash
# Force sync
argocd app sync letsgo-app

# Refresh from Git
argocd app get letsgo-app --refresh

# Rollback to previous version
argocd app rollback letsgo-app 0

# View sync history
argocd app history letsgo-app
```

### Monitor

```bash
# Watch pods update
kubectl get pods -w

# Check deployment
kubectl get deployment -l app=backend

# View running image
kubectl get deployment backend -o jsonpath='{.spec.template.spec.containers[0].image}'
```

---

## Workflow: Push → Deploy

### Step 1: Code Change
```bash
git commit -m "Fix user login bug"
git push origin main
```

### Step 2: GitHub Actions (automated)
- Builds Docker image
- Tags: `your-registry/backend:v1.0.1`
- Pushes to registry

### Step 3: Image Updater (every 2 minutes, automated)
- Detects new image in registry
- Updates `manifests/base/kustomization.yaml`
- Commits to Git: `"auto: update backend to v1.0.1"`

### Step 4: ArgoCD (every 3 seconds, automated)
- Detects Git change
- Syncs new manifests to cluster
- Kubernetes rolls out new pods

### Step 5: Live!
- Old pods replaced with new image
- Zero downtime
- Application running v1.0.1

---

## Troubleshooting Quick Fixes

| Issue | Solution |
|-------|----------|
| Image Updater not detecting new images | Check Git token, verify Application annotations |
| Git not updating | Restart Image Updater: `kubectl rollout restart -n argocd deployment/argocd-image-updater` |
| ArgoCD not syncing | Enable auto-sync: `syncPolicy.automated.selfHeal: true` |
| Pod still has old image | Restart pod: `kubectl rollout restart deployment/backend` |
| Too many Git commits | Increase poll interval: `registries.poll-interval: "5m"` |
| Private registry access denied | Add registry credentials secret |

---

## Key Concepts

**Source of Truth = Git**
- Everything in `manifests/base/kustomization.yaml` is definitive
- ArgoCD enforces it on cluster
- Manual kubectl changes are overridden

**Drift = Mismatch**
- Git says: `backend:v1.0.1`
- Cluster has: `backend:v1.0.0`
- ArgoCD detects and fixes automatically

**Image Update Strategy**
- `latest`: Always newest (risky)
- `semver`: Safe compatible updates (recommended for prod)
- `regexp`: Pattern matching (for custom naming)
- `none`: Manual only (no auto-update)

---

## Production Checklist

- [ ] GitHub token has repo permissions
- [ ] Branch protection on main (prevent direct pushes)
- [ ] Auto-sync enabled (selfHeal=true)
- [ ] Semantic versioning on images (v1.0.0 format)
- [ ] Monitoring for ArgoCD health
- [ ] Slack notifications on sync failures
- [ ] Tested rollback procedure
- [ ] Backup strategy for persistent volumes
- [ ] Resource limits configured
- [ ] Health checks on endpoints

---

## Common Update Strategies

```yaml
# Development: Always latest
annotations:
  argocd-image-updater.argoproj.io/backend.update-strategy: latest

# Production: Safe patch updates
annotations:
  argocd-image-updater.argoproj.io/backend.update-strategy: semver
  argocd-image-updater.argoproj.io/backend.semver-constraint: "~1.0"

# Staging: All compatible updates
annotations:
  argocd-image-updater.argoproj.io/backend.update-strategy: semver
  argocd-image-updater.argoproj.io/backend.semver-constraint: "^1.0"
```

---

## Semantic Versioning Constraints

```
~1.0.0  = 1.0.x only (patch updates)
^1.0.0  = 1.x.x (patch + minor updates)
>=1.0.0 = Any version
```

---

## Git Integration

### GitHub
- Token scopes: `repo`, `read:packages`
- Store in secret: `git-credentials`
- Can have multiple committers

### GitLab
- Similar process
- Use personal access tokens with `api` scope

### Self-Hosted Git
- Ensure HTTPS/SSH access
- Image Updater needs push permissions

---

## Monitoring

### What to Monitor
- ArgoCD application sync status
- Image Updater pod health
- Git commit frequency (should be rare, only on updates)
- Pod restart count (should be minimal)

### Alert on
- Image Updater pod crashlooping
- ArgoCD sync failures
- Excessive commits in Git (>1 per minute)

---

## Emergency: Manual Override

```bash
# Temporarily disable auto-sync
kubectl patch application letsgo-app -n argocd -p \
  '{"spec":{"syncPolicy":{"automated":null}}}'

# Make manual change
kubectl set image deployment/backend backend=wrong-image:v99

# Investigate issue...

# Re-enable auto-sync
kubectl patch application letsgo-app -n argocd -p \
  '{"spec":{"syncPolicy":{"automated":{"prune":true,"selfHeal":true}}}}'

# ArgoCD will auto-correct back to Git version
```

---

## Performance Tuning

```yaml
# Faster updates (more API calls):
registries.poll-interval: "1m"        # Every minute
app-resync: 30s                        # Every 30 seconds

# Slower updates (fewer API calls):
registries.poll-interval: "10m"       # Every 10 minutes
app-resync: 300s                      # Every 5 minutes
```

---

## Resources

- ArgoCD: https://argo-cd.readthedocs.io/
- Image Updater: https://argocd-image-updater.readthedocs.io/
- Kustomize: https://kustomize.io/
- GitHub Personal Tokens: https://github.com/settings/tokens
