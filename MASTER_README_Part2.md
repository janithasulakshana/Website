# ArgoCD Automated Deployment & Image Drift Detection
## Complete Implementation Guide - Part 2/3

---

## Operations & Monitoring

### Daily Operations

#### Check Deployment Status

```bash
# Application status
argocd app get letsgo-app

# Expected:
# Status:        Synced      ✓ Good
# Health:        Healthy     ✓ Good
# Sync Policy:   Automated   ✓ Good

# Check pods
kubectl get pods -n default

# Check services
kubectl get svc -n default

# Check deployments
kubectl get deployment -n default
```

#### Monitor Image Updates

```bash
# Watch Image Updater logs
kubectl logs -n argocd deployment/argocd-image-updater -f

# Expected patterns:
# ✓ "Polling registry..."
# ✓ "New image detected"
# ✓ "Successfully updated repository"

# Check for errors:
# ✗ "Failed to authenticate"
# ✗ "Image not found"
# ✗ "Connection refused"
```

#### Track Git Commits

```bash
# See Image Updater commits
git log --oneline | grep "auto: update"

# Example output:
# a1b2c3d auto: update backend image to v1.0.1
# d4e5f6g auto: update frontend image to v2.0.0
# h5i6j7k Initial commit
```

#### Monitor Drift Detection

```bash
# Real-time monitoring dashboard
bash monitor-drift-detection.sh

# Shows:
# - Application sync status (Synced / OutOfSync)
# - Running image versions
# - Pod status and count
# - Recent Git commits
# - Latest Image Updater logs
# - Health status
```

### Real-Time Monitoring

#### Kubernetes Metrics

```bash
# Pod resource usage
kubectl top pods -n default

# Node resource usage
kubectl top nodes

# Pod details
kubectl describe pod <pod-name> -n default

# Pod logs
kubectl logs -n default <pod-name>

# Previous pod logs (if crashed)
kubectl logs -n default <pod-name> --previous

# Watch pod status in real-time
kubectl get pods -w
```

#### ArgoCD Metrics

```bash
# ArgoCD server logs
kubectl logs -n argocd deployment/argocd-server -f

# Application controller logs
kubectl logs -n argocd deployment/argocd-application-controller -f

# Image Updater metrics (if Prometheus installed)
kubectl port-forward -n argocd svc/argocd-image-updater 8080:8080
# Then: localhost:8080/metrics
```

### Health Checks

#### Pod Health Configuration

```yaml
livenessProbe:
  httpGet:
    path: /api/test
    port: 5000
  initialDelaySeconds: 40
  periodSeconds: 30
  failureThreshold: 3

readinessProbe:
  httpGet:
    path: /api/test
    port: 5000
  initialDelaySeconds: 10
  periodSeconds: 10
  failureThreshold: 3
```

#### Application Health Status

```bash
# Check application health
argocd app get letsgo-app

# Health status values:
# Healthy    - All pods running, synced
# Progressing - Rollout in progress
# Degraded   - Some resources unhealthy
# Unknown    - Can't determine health
```

---

## Troubleshooting Guide

### Issue 1: Image Updater Not Detecting New Images

**Symptoms:**
- Push new image to registry
- Image Updater logs show no activity
- Git repository not updated

**Diagnosis:**

```bash
# Check if Image Updater is running
kubectl get pods -n argocd | grep image-updater

# Check logs for errors
kubectl logs -n argocd deployment/argocd-image-updater -f

# Patterns:
# ✓ "Polling registry..."       → Working
# ✗ "Failed to authenticate"    → Credential issue
# ✗ "Image not found"           → Wrong image name
```

**Solutions:**

```bash
# Solution 1: Verify Git token is valid
kubectl get secret -n argocd git-credentials

# Solution 2: Check Application annotations
kubectl get application -n argocd letsgo-app -o yaml | grep image-list

# Solution 3: Verify image names match exactly
# In Application: backend=your-registry/backend
# In kustomization: newName: your-registry/backend

# Solution 4: Check registry credentials
kubectl get secret -n argocd private-registry-credentials

# Solution 5: Increase logging level
kubectl set env deployment/argocd-image-updater \
  -n argocd \
  IMAGE_UPDATER_LOG_LEVEL=debug

# Solution 6: Restart Image Updater
kubectl rollout restart deployment -n argocd argocd-image-updater
```

### Issue 2: ArgoCD Not Syncing After Image Update

**Symptoms:**
- Git has new image tag
- ArgoCD shows "OutOfSync"
- Application not deploying

**Diagnosis:**

```bash
# Check if auto-sync is enabled
kubectl get application -n argocd letsgo-app -o yaml | grep -A 5 syncPolicy

# Check application status
argocd app get letsgo-app

# Look for sync errors
kubectl describe application -n argocd letsgo-app | grep -A 10 Status
```

**Solutions:**

```bash
# Solution 1: Enable auto-sync
kubectl patch application letsgo-app -n argocd -p \
  '{"spec":{"syncPolicy":{"automated":{"prune":true,"selfHeal":true}}}}'

# Solution 2: Manual sync
argocd app sync letsgo-app

# Solution 3: Refresh application
argocd app get letsgo-app --refresh

# Solution 4: Check ArgoCD server health
kubectl get pods -n argocd | grep argocd-server

# Solution 5: Verify Git credentials
kubectl logs -n argocd deployment/argocd-server -f | grep -i "auth"
```

### Issue 3: Pod Still Has Old Image After Sync

**Symptoms:**
- ArgoCD shows "Synced"
- But pod still running old image
- Deployment spec updated, but pods not restarted

**Diagnosis:**

```bash
# Check deployment image
kubectl get deployment backend \
  -o jsonpath='{.spec.template.spec.containers[0].image}'

# Check running pod image
kubectl get pod -l app=backend \
  -o jsonpath='{.items[0].spec.containers[0].image}'

# Check imagePullPolicy
kubectl get deployment backend \
  -o jsonpath='{.spec.template.spec.containers[0].imagePullPolicy}'

# Check pod status
kubectl get pods -l app=backend -o wide
```

**Solutions:**

```bash
# Solution 1: Force pod restart
kubectl rollout restart deployment backend

# Solution 2: Delete pod to force recreation
kubectl delete pod -l app=backend

# Solution 3: Verify imagePullPolicy is "Always"
kubectl patch deployment backend -p \
  '{"spec":{"template":{"spec":{"containers":[{"name":"backend","imagePullPolicy":"Always"}]}}}}'

# Solution 4: Check image exists in registry
docker pull your-registry/backend:v1.0.1

# Solution 5: Check image pull secrets (if private)
kubectl get secrets | grep dockercfg
```

### Issue 4: Image Updater Credentials Error

**Symptoms:**
- Image Updater logs: "Failed to authenticate"
- "Permission denied" errors
- Can't push commits to Git

**Solutions:**

```bash
# Solution 1: Regenerate GitHub token
# GitHub: Settings → Personal access tokens → Generate new
# Scopes: repo, read:packages

# Solution 2: Update secret
kubectl create secret generic git-credentials \
  --from-literal=git.token=ghp_xxxxxxxxxxxx \
  -n argocd --dry-run=client -o yaml | kubectl apply -f -

# Solution 3: Verify token has write access
# GitHub: Repository → Settings → Collaborators

# Solution 4: Restart Image Updater
kubectl rollout restart deployment -n argocd argocd-image-updater
```

### Issue 5: Kustomization.yaml Not Being Updated

**Symptoms:**
- Image Updater logs show success
- But kustomization.yaml unchanged
- Image tag still old

**Solutions:**

```bash
# Solution 1: Verify kustomization.yaml format
head -5 manifests/base/kustomization.yaml
# Should have: apiVersion, kind, images sections

# Solution 2: Check write-back configuration
kubectl get application -n argocd letsgo-app -o yaml | grep write-back

# Solution 3: Update Application if annotations missing
kubectl patch application letsgo-app -n argocd --type json -p='
[
  {"op":"add","path":"/metadata/annotations/argocd-image-updater.argoproj.io~1write-back-method","value":"kustomize"},
  {"op":"add","path":"/metadata/annotations/argocd-image-updater.argoproj.io~1write-back-target","value":"kustomization.yaml"}
]'

# Solution 4: Verify Application source path
kubectl get application -n argocd letsgo-app \
  -o jsonpath='{.spec.source.path}'

# Solution 5: Restart Image Updater
kubectl rollout restart deployment -n argocd argocd-image-updater
```

### Emergency Recovery

```bash
# Use cleanup and recovery script
bash argocd-cleanup-recovery.sh

# Or manual steps:

# 1. Delete Application
kubectl delete application letsgo-app -n argocd

# 2. Delete Image Updater
kubectl delete deployment -n argocd argocd-image-updater

# 3. Delete secrets
kubectl delete secret -n argocd git-credentials

# 4. Reapply everything
kubectl apply -f argocd-image-updater.yaml
kubectl apply -f argocd-application.yaml

# 5. Verify
kubectl get pods -n argocd
argocd app get letsgo-app
```

---

## Production Deployment

### Pre-Production Checklist

- [ ] GitHub token created with correct scopes
- [ ] Repository has branch protection on main
- [ ] Images use semantic versioning (v1.0.0 format)
- [ ] All manifests validated and tested
- [ ] ArgoCD installed and healthy
- [ ] Image Updater running and connected
- [ ] Git credentials secret created
- [ ] Application synced and healthy
- [ ] Monitoring and alerts configured
- [ ] Backup strategy in place
- [ ] Rollback procedure documented
- [ ] Team trained on operations

### Production Configuration

#### Conservative ArgoCD Settings

```yaml
# argocd/applications/prod-app.yaml
spec:
  syncPolicy:
    automated:
      prune: false          # Never delete orphaned resources
      selfHeal: false       # Don't auto-correct (manual review)
    syncOptions:
      - RespectIgnoreDifferences=true
```

#### Conservative Image Update Strategy

```yaml
# Only patch version updates (1.0.0 → 1.0.1)
argocd-image-updater.argoproj.io/backend.update-strategy: semver
argocd-image-updater.argoproj.io/backend.semver-constraint: "~1.0"
# Blocks: 1.1.0 (breaking), 2.0.0 (major)
```

#### Production Kustomization

```yaml
# manifests/overlays/production/kustomization.yaml
replicas:
  - name: backend
    count: 3
  - name: frontend
    count: 3

images:
  - name: backend
    newName: your-registry/backend
    newTag: v1.0.0
  - name: frontend
    newName: your-registry/frontend
    newTag: v1.0.0
```

### Monitoring Setup

#### Recommended Alerts

```yaml
# Alert conditions:
- ImageUpdaterDown: No pods for 5 minutes
- ImageUpdaterHighErrorRate: Error rate > 10%
- DriftDetectionFailed: Sync failures > 10
- PodCrashLooping: Restarted > 5 times
- DeploymentUnhealthy: Replicas not matching
- PersistentVolumeFull: Usage > 80%
```

---

## Security & Best Practices

### Secret Management

#### GitHub Token Security

```bash
# ✓ DO:
# - Generate token with only needed scopes
# - Store in Kubernetes Secret
# - Rotate every 30 days
# - Use environment variables for CI/CD

# ✗ DON'T:
# - Commit token to Git
# - Share between systems
# - Leave unchanged for months
```

#### Registry Credentials

```bash
# For private registries:
kubectl create secret docker-registry private-registry \
  --docker-server=your-registry.com \
  --docker-username=username \
  --docker-password=password \
  -n argocd

# Reference in Image Updater:
credentials: secret:private-registry
```

### RBAC

#### Image Updater Permissions

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: argocd-image-updater
rules:
  # Read-only on Applications
  - apiGroups: [argoproj.io]
    resources: [applications]
    verbs: [get, list, watch]
  
  # Read-only on Secrets
  - apiGroups: [""]
    resources: [secrets, configmaps]
    verbs: [get, list]
```

### Image Security

#### Image Scanning

```bash
# With Trivy:
trivy image your-registry/backend:v1.0.1

# Check for HIGH/CRITICAL
trivy image --severity HIGH,CRITICAL your-registry/backend:v1.0.1
```

### GitOps Best Practices

#### Single Source of Truth

```yaml
# Git repository is the ONLY source of truth:
# - Cluster state from Git
# - Image versions from Git
# - Configuration from Git
# - Changes tracked in Git
```

#### Audit Trail

```bash
# All changes tracked in Git:
git log --oneline

# Example:
# a1b2c3d auto: update backend image to v1.0.1
# d4e5f6g manual: increase replicas to 5
```

---

**Continue to Part 3 for FAQ, Commands, and Additional Resources**
