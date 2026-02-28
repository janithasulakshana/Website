# ArgoCD Automated Deployment & Image Drift Detection - Complete Implementation

## 📚 Documentation Overview

This package contains a complete, production-ready setup for automated Kubernetes deployments using ArgoCD and Image Drift Detection.

### Core Documentation (Read in Order)

1. **START HERE**: `ARGOCD_COMPLETE_SUMMARY.md` - Overview & architecture
2. `ARGOCD_QUICK_REFERENCE.md` - Commands & concepts cheat sheet
3. `ARGOCD_SETUP_GUIDE.md` - Step-by-step setup instructions
4. `IMAGE_DRIFT_DETECTION_EXPLAINED.md` - How drift detection works

### Advanced Topics

- `ARGOCD_IMAGE_AUTOMATION_GUIDE.md` - Technical deep dive
- `PRODUCTION_CONFIGURATION_EXAMPLES.md` - Production-grade configs
- `CICD_BEST_PRACTICES.md` - GitHub Actions & CI/CD integration
- `ARGOCD_TROUBLESHOOTING.md` - Common issues & solutions

---

## 🚀 Quick Start (5 Minutes)

### 1. Install ArgoCD & Image Updater

```bash
# Use automated setup script
bash complete-deployment.sh

# Or manual setup
bash argocd-setup.sh
```

### 2. Configure Files

Update these files with YOUR values:

```bash
# Git token (GitHub Personal Access Token)
# Replace: ghp_YOUR_GITHUB_TOKEN_HERE

# Git repository URL
# Replace: https://github.com/your-org/k8s-manifests.git

# Image registry
# Replace: your-registry/backend and your-registry/frontend
```

### 3. Push to Git

```bash
git add .
git commit -m "Initial: ArgoCD automated deployment"
git push origin main
```

### 4. Test End-to-End

```bash
# Run end-to-end tests
bash test-argocd-setup.sh

# Monitor drift detection
bash monitor-drift-detection.sh
```

---

## 📁 Files Provided (18 Total)

### Configuration Files (6)

| File | Purpose |
|------|---------|
| `argocd-application.yaml` | Main ArgoCD Application with image update config |
| `argocd-image-updater.yaml` | Image Updater deployment & RBAC |
| `manifests-base-kustomization.yaml` | Kustomize base (Image Updater modifies this) |
| `kustomization-dev.yaml` | Dev environment (1 replica, auto-latest) |
| `kustomization-prod.yaml` | Prod environment (3 replicas, semver only) |
| `github-actions-build.yaml` | CI/CD: Build & push Docker images |

### Documentation (8)

| File | Purpose |
|------|---------|
| `ARGOCD_COMPLETE_SUMMARY.md` | Complete overview (this is your starting point) |
| `ARGOCD_QUICK_REFERENCE.md` | Quick command reference & concepts |
| `ARGOCD_SETUP_GUIDE.md` | Step-by-step setup with directory structure |
| `IMAGE_DRIFT_DETECTION_EXPLAINED.md` | How drift detection mechanism works |
| `ARGOCD_IMAGE_AUTOMATION_GUIDE.md` | Technical reference guide |
| `PRODUCTION_CONFIGURATION_EXAMPLES.md` | Production-grade configurations |
| `CICD_BEST_PRACTICES.md` | GitHub Actions & CI/CD integration |
| `ARGOCD_TROUBLESHOOTING.md` | Issues, solutions, debugging |

### Scripts (4)

| File | Purpose |
|------|---------|
| `complete-deployment.sh` | One-command deployment (automated) |
| `argocd-setup.sh` | Manual ArgoCD setup with validation |
| `monitor-drift-detection.sh` | Real-time drift detection monitor |
| `test-argocd-setup.sh` | End-to-end verification tests |
| `argocd-cleanup-recovery.sh` | Emergency cleanup & recovery |

---

## 🔑 How It Works in 60 Seconds

```
1. Developer:      git push code
                        ↓
2. CI/CD:          Build image → Push to registry (backend:v1.0.1)
                        ↓
3. Image Updater:  Detects new image → Updates Git → Commits
                   (manifests/base/kustomization.yaml)
                        ↓
4. ArgoCD:         Detects Git change → Syncs manifests → Applies
                        ↓
5. Kubernetes:     Rolling update → Pods restart with v1.0.1
                        ↓
6. Result:         ✓ Application live in ~2-3 minutes
                   ✓ Zero downtime
                   ✓ Fully automated
```

---

## 📋 What You Must Configure

### 1. GitHub Token (for Image Updater to push commits)

```bash
# Generate on GitHub:
# Settings → Developer settings → Personal access tokens

# Token needs scopes: repo, read:packages

# Store in: argocd-image-updater.yaml
# Replace: ghp_YOUR_GITHUB_TOKEN_HERE
```

### 2. Git Repository URL

```bash
# In argocd-application.yaml and argocd-image-updater.yaml
# Replace: https://github.com/your-org/k8s-manifests.git
```

### 3. Image Registry

```bash
# In manifests-base-kustomization.yaml
# Replace: your-registry with your actual registry
# Examples: docker.io, your-registry.azurecr.io, 123456789.dkr.ecr.us-east-1.amazonaws.com
```

### 4. Git Repository Structure

```
your-k8s-repo/
├── manifests/base/
│   ├── backend-deployment.yaml
│   ├── frontend-deployment.yaml
│   ├── configmap.yaml
│   ├── secret.yaml
│   ├── storage.yaml
│   ├── ingress.yaml
│   └── kustomization.yaml (Image Updater modifies this!)
├── argocd/applications/
│   └── app.yaml
└── .github/workflows/
    └── build-and-push.yml
```

---

## 🎯 Deployment Strategies by Environment

### Development: Auto-Everything

```yaml
# Auto-deploy latest images (no approval needed)
update-strategy: latest
auto-sync: enabled
```

### Staging: Conservative Auto-Updates

```yaml
# Auto-deploy compatible minor updates
update-strategy: semver
semver-constraint: "^1.0"  # 1.x.x only
```

### Production: Manual & Controlled

```yaml
# Only patch updates, requires manual review
update-strategy: semver
semver-constraint: "~1.0"  # 1.0.x only
auto-sync: disabled (review required)
```

---

## ✅ Verification Checklist

### After Installation

- [ ] ArgoCD UI accessible (port-forward or ingress)
- [ ] Image Updater pod is running
- [ ] Git credentials secret created
- [ ] Application shows in ArgoCD UI
- [ ] Deployments synced and healthy

### After First Image Push

- [ ] Image Updater detects new image (check logs)
- [ ] Git repository has new commit from Image Updater
- [ ] ArgoCD Application shows "OutOfSync" (drift detected)
- [ ] ArgoCD auto-syncs (if enabled)
- [ ] Pods restart with new image
- [ ] Old pods terminate

### Production Readiness

- [ ] Semantic versioning on images (v1.0.0 format)
- [ ] Branch protection on main
- [ ] Backup strategy for persistent volumes
- [ ] Monitoring and alerts configured
- [ ] Rollback procedure tested
- [ ] Team trained on operation

---

## 🛠️ Common Operations

### Monitor Deployment Progress

```bash
# Watch pods update in real-time
bash monitor-drift-detection.sh

# Or manually
kubectl get pods -w
```

### Check Image Updater Logs

```bash
kubectl logs -n argocd deployment/argocd-image-updater -f
```

### Force Manual Sync

```bash
argocd app sync letsgo-app
```

### View Git Commits from Image Updater

```bash
git log --oneline | grep "auto: update"
```

### Rollback to Previous Version

```bash
# Option 1: Revert Git commit
git revert <commit-hash>
git push

# Option 2: ArgoCD rollback
argocd app rollback letsgo-app 0
```

---

## 🚨 Troubleshooting

### Image Updater Not Detecting New Images

```bash
# Check logs
kubectl logs -n argocd deployment/argocd-image-updater -f

# Common issues:
# 1. Git token invalid
# 2. Application missing image-list annotation
# 3. Image names don't match between app and kustomization
```

### ArgoCD Not Syncing After Image Update

```bash
# Check auto-sync is enabled
kubectl get application -n argocd letsgo-app -o yaml | grep -A 5 syncPolicy

# Manual sync
argocd app sync letsgo-app
```

### Pods Still Have Old Image

```bash
# Force restart
kubectl rollout restart deployment/backend
```

Full troubleshooting guide: `ARGOCD_TROUBLESHOOTING.md`

---

## 📊 Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                   GITHUB REPOSITORY                      │
│  manifests/base/kustomization.yaml (image tags)         │
└────────────────────────────────────────────────────────┘
                     ▲                 ▼
         Image Updater (commits)  ArgoCD (syncs)
                     ▲                 ▼
├──────────────────────────────────────────────────────────┤
│                   KUBERNETES CLUSTER                      │
│  ┌──────────────────────────────────────────────────────┐│
│  │ ArgoCD Components:                                   ││
│  │ - argocd-server (UI & API)                           ││
│  │ - argocd-controller (applies manifests)              ││
│  │ - argocd-image-updater (detects drift)               ││
│  └──────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────┐│
│  │ Application Workloads:                               ││
│  │ - Backend Pods (image: backend:v1.0.1)               ││
│  │ - Frontend Pods (image: frontend:v1.0.1)             ││
│  └──────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────┘
                     ▲                 
           Docker Registry (v1.0.1)
```

---

## 📚 Learning Resources

### Key Concepts

- **Git as Source of Truth**: Everything defined in Git, applied to cluster
- **Drift Detection**: Mismatch between Git and running cluster triggers sync
- **Kustomize**: Kubernetes template engine for managing variants
- **Semantic Versioning**: v1.0.0 format for version constraints

### External Resources

- ArgoCD Docs: https://argo-cd.readthedocs.io/
- Image Updater Docs: https://argocd-image-updater.readthedocs.io/
- Kustomize: https://kustomize.io/
- Kubernetes: https://kubernetes.io/docs/

---

## ❓ FAQ

### Q: How long does it take from image push to deployment?

**A:** 2-3 minutes typically:
- Image Updater polls every 2 minutes
- ArgoCD polls every 3 seconds
- Kubernetes rolling update: ~30-60 seconds

### Q: Can I manually update images?

**A:** Yes! Edit `manifests/base/kustomization.yaml`, commit, and push. ArgoCD will detect and deploy.

### Q: What if I need to prevent auto-updates?

**A:** Use semantic versioning constraints:
- `~1.0` = only 1.0.x (patch updates)
- `^1.0` = only 1.x.x (minor updates)
- Disable auto-sync for manual approval

### Q: How do I rollback?

**A:** Revert Git commit: `git revert <hash>` and push. ArgoCD will auto-deploy the previous version.

### Q: Is this suitable for production?

**A:** Yes! Configure with:
- Semantic versioning
- Manual approval
- Monitoring & alerts
- Regular backups

---

## 🔒 Security Considerations

### Secrets Management

- GitHub tokens stored in Kubernetes Secrets
- Never commit secrets to Git
- Use secret rotation regularly

### RBAC

- Image Updater has minimal permissions
- ArgoCD uses service accounts
- Restrict cluster role access

### GitOps

- All changes tracked in Git
- Audit trail for compliance
- Branch protection for production

### Image Security

- Sign images with cosign
- Scan for vulnerabilities
- Use specific versions (no "latest" in prod)

---

## 📞 Support & Issues

### Getting Help

1. Check `ARGOCD_TROUBLESHOOTING.md`
2. Review logs: `kubectl logs -n argocd <pod>`
3. Check Git commits: `git log --oneline`
4. Test manually: `argocd app get letsgo-app --refresh`

### Reporting Issues

1. Describe what you expected to happen
2. Show what actually happened
3. Provide logs and configuration
4. Specify versions (ArgoCD, Image Updater, K8s)

---

## 📝 Next Steps

1. **Read**: Start with `ARGOCD_COMPLETE_SUMMARY.md`
2. **Configure**: Update all `your-*` placeholders
3. **Setup**: Run `bash complete-deployment.sh`
4. **Test**: Run `bash test-argocd-setup.sh`
5. **Monitor**: Run `bash monitor-drift-detection.sh`
6. **Deploy**: Push first image and watch it auto-deploy!

---

## 📄 License

This implementation package is provided as-is for educational and production use.

---

## 🎉 Success!

When everything works, you'll have:

✅ Fully automated deployment pipeline
✅ Zero-manual-intervention deployments
✅ Automatic rollbacks when needed
✅ Complete Git audit trail
✅ Zero-downtime updates
✅ Production-ready system

**You're ready to deploy!**

For detailed instructions, see: `ARGOCD_SETUP_GUIDE.md`
