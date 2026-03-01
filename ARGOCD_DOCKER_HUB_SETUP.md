# ArgoCD + Image Updater Setup Complete ✅

## Current Architecture

Your system is now configured for **automatic Docker Hub image deployment** to Docker Desktop Kubernetes using ArgoCD and ArgoCD Image Updater!

```
GitHub (Push) 
    ↓
GitHub Actions (build.yml → deploy.yml)
    ↓
Docker Hub (Images pushed with :latest tag)
    ↓
ArgoCD Image Updater (Watches Docker Hub for new images)
    ↓
ArgoCD Application (Detects image changes)
    ↓
Kubernetes Deployment (Auto-updates containers)
    ↓
Docker Desktop (Rolls out new pods)
```

---

## What Was Just Created

### 1. **Kubernetes Deployment Manifests**
- `deployment-backend.yaml` - Backend deployment with 1 replica
- `deployment-frontend.yaml` - Frontend deployment with 1 replica
- `secret-app.yaml` - Application secrets (JWT_SECRET)
- Both include ArgoCD Image Updater annotations for auto-image updates

### 2. **ArgoCD Application Updated**
- `argocd-local-app.yaml` - Now configured to:
  - Sync from GitHub repo (main branch)
  - Monitor `deployment-*.yaml` and `secret-app.yaml` files
  - Auto-sync enabled (prune + selfHeal)
  - Image Updater annotations added for automatic updates

### 3. **ArgoCD Image Updater**
- Already deployed in argocd namespace (from previous setup)
- Runs every 2 minutes to check Docker Hub for new images
- Automatically updates deployment manifests when new images found

---

## 🔴 REQUIRED: Update Docker Hub Username

The deployments are currently failing with `ErrImagePull` because they reference placeholder usernames.

### Step 1: Update Docker Hub Username in Deployments

Replace `your-docker-username` with your actual Docker Hub username in:

**File 1: deployment-backend.yaml**
```bash
# Find this line:
image: your-docker-username/website-backend:latest

# Replace with (use YOUR Docker Hub username):
image: yourusername/website-backend:latest
```

**File 2: deployment-frontend.yaml**
```bash
# Find this line:
image: your-docker-username/website-frontend:latest

# Replace with (use YOUR Docker Hub username):
image: yourusername/website-frontend:latest
```

### Step 2: Update ArgoCD Application Annotations

**File: argocd-local-app.yaml**
```bash
# Find these lines:
argocd-image-updater.argoproj.io/website-backend.image-spec: your-docker-username/website-backend
argocd-image-updater.argoproj.io/website-frontend.image-spec: your-docker-username/website-frontend

# Replace with:
argocd-image-updater.argoproj.io/website-backend.image-spec: yourusername/website-backend
argocd-image-updater.argoproj.io/website-frontend.image-spec: yourusername/website-frontend
```

### Step 3: Apply Updated Manifests

```bash
# Update deployments
kubectl apply -f deployment-backend.yaml -f deployment-frontend.yaml

# Update ArgoCD application
kubectl apply -f argocd-local-app.yaml
```

### Step 4: Verify Pods Are Running

```bash
# Check deployment status
kubectl get deployments -n default

# Check pod status
kubectl get pods -n default

# Watch pod startup
kubectl get pods -n default -w
```

---

## How It Works: Complete Flow

### 🔄 Automatic Update Flow

**1. Developer Workflow**
```
User pushes code to GitHub main branch
        ↓
GitHub Actions build.yml runs
  - npm ci (install dependencies)
  - npm run build (build frontend)
  - Docker build (create images)
        ↓
GitHub Actions deploy.yml runs
  - Docker Hub login (using secrets)
  - docker push yourusername/website-backend:latest
  - docker push yourusername/website-backend:{short-sha}
  - docker push yourusername/website-frontend:latest
  - docker push yourusername/website-frontend:{short-sha}
        ↓
New images now in Docker Hub
```

**2. ArgoCD Image Updater Workflow** (Every 2 minutes)
```
ArgoCD Image Updater checks Docker Hub
        ↓
Compares :latest tag with deployment manifest
        ↓
If new image found:
  ├─ Updates deployment manifest with new image digest
  ├─ Commits changes to GitHub repo
  └─ Triggers ArgoCD sync
        ↓
ArgoCD Application syncs
```

**3. Kubernetes Deployment Workflow**
```
New image pulled from Docker Hub
        ↓
Rolling update starts
  ├─ Kill old pod (max 0 unavailable)
  ├─ Start new pod with new image
  └─ Wait for health checks to pass
        ↓
New version live on localhost:5173
```

---

## 📊 ArgoCD Image Updater Annotations Explained

```yaml
metadata:
  annotations:
    # List of images to monitor
    argocd-image-updater.argoproj.io/image-list: website-backend,website-frontend
    
    # Backend image settings
    argocd-image-updater.argoproj.io/website-backend.image-spec: yourusername/website-backend
    argocd-image-updater.argoproj.io/website-backend.update-strategy: latest
    argocd-image-updater.argoproj.io/website-backend.allow-tags: regexp:^[v]?[0-9]+\.[0-9]+\.[0-9]+$
    
    # Frontend image settings
    argocd-image-updater.argoproj.io/website-frontend.image-spec: yourusername/website-frontend
    argocd-image-updater.argoproj.io/website-frontend.update-strategy: latest
    argocd-image-updater.argoproj.io/website-frontend.allow-tags: regexp:^[v]?[0-9]+\.[0-9]+\.[0-9]+$
```

| Setting | What It Does |
|---------|-------------|
| `image-list` | Which images to monitor |
| `image-spec` | Docker Hub repository path |
| `update-strategy` | Use `latest` tag (pull latest image) |
| `allow-tags` | Regex filter for semantic versions (optional) |

---

## 🚀 Complete End-to-End Example

### Example: You Update Backend Code

```
1. Edit backend code locally
   └─ backend/server.js

2. Commit and push to GitHub
   └─ git push origin main

3. GitHub Actions build.yml starts
   └─ Tests code, builds Docker image

4. GitHub Actions deploy.yml starts (after build succeeds)
   └─ Pushes to Docker Hub:
      ├─ yourusername/website-backend:latest
      └─ yourusername/website-backend:a1b2c3d

5. Within 2 minutes, ArgoCD Image Updater detects new image
   └─ Updates deployment-backend.yaml with new image digest

6. ArgoCD Application auto-syncs
   └─ Pulls new deployment manifest from GitHub

7. Kubernetes rolling update starts
   └─ Old pod terminates → New pod starts with new image

8. Within 30 seconds, new backend is live
   └─ http://localhost:5000 now running latest code
```

---

## ✅ Deployment Checklist

- [ ] Updated Docker Hub username in `deployment-backend.yaml`
- [ ] Updated Docker Hub username in `deployment-frontend.yaml`
- [ ] Updated Docker Hub username in `argocd-local-app.yaml` annotations
- [ ] Ran `kubectl apply -f deployment-backend.yaml -f deployment-frontend.yaml`
- [ ] Ran `kubectl apply -f argocd-local-app.yaml`
- [ ] Verified `kubectl get pods -n default` shows both pods as READY (2/2 or 1/1)
- [ ] Accessed http://localhost:5173 in browser
- [ ] Verified backend responding at http://localhost:5000/api/test

---

## 📋 Files Modified/Created

| File | Status | Purpose |
|------|--------|---------|
| `deployment-backend.yaml` | ✅ Created | Backend deployment with image updater annotations |
| `deployment-frontend.yaml` | ✅ Created | Frontend deployment with image updater annotations |
| `secret-app.yaml` | ✅ Created | Application secrets (JWT_SECRET) |
| `argocd-local-app.yaml` | ✅ Updated | Added image updater annotations + deployment manifest filtering |
| `argocd-image-updater.yaml` | ✅ Already exists | Controls automatic image updates |

---

## 🔗 Access Points

Once deployments are running:

| Component | URL | Purpose |
|-----------|-----|---------|
| Frontend | http://localhost:5173 | React app (via port-forward) |
| Backend API | http://localhost:5000 | Express server (via port-forward) |
| ArgoCD UI | https://localhost:8888 | Deployment dashboard |
| Kubernetes | kubectl | Cluster management |

---

## 📝 Next Steps

1. **Update Docker Hub usernames** in the three files above
2. **Apply updated manifests**: `kubectl apply -f deployment-backend.yaml -f deployment-frontend.yaml -f argocd-local-app.yaml`
3. **Wait for pods to become READY**: `kubectl get pods -n default -w`
4. **Test the application**: http://localhost:5173
5. **Make a code change** and push to GitHub to trigger full CI/CD pipeline
6. **Watch automatic deployment** via ArgoCD UI at https://localhost:8888

---

## ❓ Troubleshooting

### Pods still showing ErrImagePull?
```bash
# Check pod events for error details
kubectl describe pod {pod-name} -n default

# Common issues:
# - Docker Hub username not updated
# - Image doesn't exist in Docker Hub yet
# - Docker Hub is private and needs credentials
```

### Image not updating automatically?
```bash
# Check Image Updater logs
kubectl logs -n argocd -l app.kubernetes.io/name=argocd-image-updater

# Check if argocd-image-updater pod is running
kubectl get pods -n argocd
```

### Want to manually sync?
```bash
# Force ArgoCD to sync immediately
argocd app sync letsgo-app-local
```

---

## 🎯 Summary

**Before**: Pod deployed manually with static images
**After**: Kubernetes Deployments + ArgoCD + Image Updater = Automatic GitOps pipeline

Every time you push to GitHub:
1. ✅ GitHub Actions builds and tests code
2. ✅ GitHub Actions pushes images to Docker Hub
3. ✅ ArgoCD Image Updater detects new images (every 2 min)
4. ✅ ArgoCD updates manifests automatically
5. ✅ Kubernetes rolls out new pods
6. ✅ Your users see new version in seconds

**Fully automated, GitOps-native deployment pipeline!** 🚀

