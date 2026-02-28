# ArgoCD Automated Deployment with Image Drift Detection

## Overview

ArgoCD is a declarative, GitOps-based continuous deployment tool for Kubernetes. It automatically syncs your cluster state to match your Git repository. For image updates, ArgoCD detects drift between what's running and what's in Git, then automatically redeploys.

## How ArgoCD Detects New Images (Image Drift)

### 1. **Image Versioning in Git (The Source of Truth)**
ArgoCD doesn't automatically fetch new images from registries. Instead, you must update the image tag in your Git repository. ArgoCD then:
- Detects the diff between Git and running cluster
- Triggers deployment if versions don't match
- Applies the new manifest (which pulls the new image)

### 2. **Image Update Strategies**

#### Option A: Manual Update (Simple)
- Update image tag in Git manually
- Push to repository
- ArgoCD detects drift and redeploys
- Best for: Stable releases, controlled deployments

#### Option B: Automated Image Update with Image Updater (Recommended)
- ArgoCD Image Updater watches container registries
- Detects new images matching a pattern
- Automatically commits new image tags to Git
- ArgoCD then syncs these changes
- Best for: CI/CD pipelines, frequent updates

#### Option C: Webhook + Automation
- Registry sends webhook when new image is pushed
- External service updates Git with new tag
- ArgoCD detects and syncs
- Best for: Complex workflows

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Git Repository                           │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ k8s-manifests/                                          ││
│  │  ├── backend-deployment.yaml (image: backend:v1.2.3)   ││
│  │  ├── frontend-deployment.yaml (image: frontend:v1.1.0) ││
│  │  └── argocd-config/                                    ││
│  │      └── app.yaml (ArgoCD Application manifest)        ││
│  └─────────────────────────────────────────────────────────┘│
│                            ▲                                  │
│                            │ (2) Push new tag               │
│                            │                                  │
│                    ArgoCD Image Updater                      │
│                    (watches registries)                      │
└─────────────────────────────────────────────────────────────┘
                            ▲
                            │
                    (1) New image pushed
                            │
         ┌──────────────────┴──────────────────┐
         │                                     │
    Docker Registry               Other Registries
    (Docker Hub, ECR)           (Quay, GitHub, etc)

         ▼
    ┌─────────────────────────────────────────┐
    │      Kubernetes Cluster                 │
    │  ┌──────────────────────────────────────┤
    │  │ ArgoCD                               │
    │  │ (3) Detects drift in Git             │
    │  │ (4) Applies new manifests            │
    │  │ (5) Pulls new image                  │
    │  └──────────────────────────────────────┤
    │  ┌──────────────────────────────────────┤
    │  │ Backend Pod (v1.2.3)                 │
    │  │ Frontend Pod (v1.1.0)                │
    │  └──────────────────────────────────────┘
    └─────────────────────────────────────────┘
```

## Implementation Methods

### METHOD 1: ArgoCD Image Updater (Recommended)

**How it works:**
1. ArgoCD Image Updater runs in the cluster
2. Watches container registries for new images
3. Automatically updates image tags in Git
4. ArgoCD detects changes and syncs

**Pros:**
- Fully automated end-to-end
- No manual Git updates needed
- Works with any registry
- Can apply version filters (semver, regex)

**Cons:**
- Requires additional component (Image Updater)
- Needs Git push permissions
- Requires setup and configuration

### METHOD 2: Kustomize with Image Patches

**How it works:**
1. Store base manifests without version tags
2. Use Kustomize overlays for versioning
3. External tool updates kustomization.yaml
4. ArgoCD detects and syncs

**Pros:**
- More structured approach
- Easy version management
- Good for multiple environments

**Cons:**
- Requires Kustomize knowledge
- More complex setup

### METHOD 3: Helm with Image Tag Values

**How it works:**
1. Use Helm charts for deployments
2. Store image tags in values.yaml
3. External tool updates values
4. ArgoCD syncs Helm chart

**Pros:**
- Clean separation of config and templates
- Powerful templating
- Easy parameterization

**Cons:**
- Requires Helm knowledge
- Additional abstraction layer

## Directory Structure for ArgoCD

```
your-k8s-repo/
├── README.md
├── .github/
│   └── workflows/
│       └── build-and-push.yml          # CI: Build Docker image
├── argocd/
│   ├── install/
│   │   ├── namespace.yaml              # ArgoCD namespace
│   │   ├── argocd-install.yaml          # ArgoCD manifests (or use Helm)
│   │   └── image-updater-install.yaml   # Image Updater manifests
│   ├── config/
│   │   ├── secret-registries.yaml       # Registry credentials
│   │   ├── rbac.yaml                    # RBAC for Image Updater
│   │   └── image-updater-config.yaml    # Image Updater settings
│   └── applications/
│       ├── app.yaml                     # ArgoCD Application resource
│       └── appproject.yaml              # ArgoCD AppProject (optional)
├── manifests/
│   ├── base/                            # Base manifests
│   │   ├── backend-deployment.yaml
│   │   ├── backend-service.yaml
│   │   ├── frontend-deployment.yaml
│   │   ├── frontend-service.yaml
│   │   ├── configmap.yaml
│   │   ├── secret.yaml
│   │   ├── storage.yaml
│   │   ├── ingress.yaml
│   │   └── kustomization.yaml
│   └── overlays/
│       ├── development/                 # Dev environment
│       │   ├── kustomization.yaml
│       │   └── config-patch.yaml
│       └── production/                  # Prod environment
│           ├── kustomization.yaml
│           ├── config-patch.yaml
│           ├── replica-patch.yaml
│           └── resource-patch.yaml
└── scripts/
    ├── setup-argocd.sh
    ├── update-image.sh                  # Manual image update
    └── cleanup.sh
```

## Step-by-Step Setup

### STEP 1: Install ArgoCD

```bash
# Create namespace
kubectl create namespace argocd

# Install ArgoCD (using Helm or manifests)
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Wait for ArgoCD to be ready
kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=argocd-server -n argocd --timeout=300s

# Get initial admin password
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d

# Port forward to access UI
kubectl port-forward svc/argocd-server -n argocd 8080:443
```

Then access: https://localhost:8080 (username: admin, password from above)

### STEP 2: Create Git Repository Structure

Create a new Git repository with the structure shown above:

```bash
git clone https://github.com/your-org/k8s-manifests.git
cd k8s-manifests

# Create directories
mkdir -p argocd/{install,config,applications}
mkdir -p manifests/{base,overlays/{development,production}}
mkdir -p scripts .github/workflows

# Copy your existing Kubernetes manifests to manifests/base/
cp /path/to/your/backend-deployment.yaml manifests/base/
cp /path/to/your/frontend-deployment.yaml manifests/base/
# ... copy other manifests
```

### STEP 3: Create Kustomization Files

Create `manifests/base/kustomization.yaml`:
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

images:
  - name: backend
    newName: your-registry/backend
    newTag: v1.0.0
  - name: frontend
    newName: your-registry/frontend
    newTag: v1.0.0

commonLabels:
  app.kubernetes.io/managed-by: argocd
```

### STEP 4: Create ArgoCD Application Manifest

Create `argocd/applications/app.yaml`:

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: letsgo-app
  namespace: argocd
  finalizers:
    - resources-finalizer.argocd.argoproj.io
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
      prune: true      # Delete resources not in Git
      selfHeal: true   # Automatically sync drift
      allow:
        empty: false
    syncOptions:
      - CreateNamespace=true
    retry:
      limit: 5
      backoff:
        duration: 5s
        factor: 2
        maxDuration: 3m
```

**Key fields explained:**
- `spec.source.repoURL`: Your Git repository
- `spec.source.path`: Path to Kustomize/Helm
- `spec.syncPolicy.automated.prune`: Delete orphaned resources
- `spec.syncPolicy.automated.selfHeal`: Sync drift automatically

### STEP 5: Install ArgoCD Image Updater

Create `argocd/install/image-updater-install.yaml`:

```yaml
---
apiVersion: v1
kind: ServiceAccount
metadata:
  name: argocd-image-updater
  namespace: argocd

---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: argocd-image-updater
rules:
  - apiGroups:
      - argoproj.io
    resources:
      - applications
      - appprojects
    verbs:
      - get
      - list
      - watch
  - apiGroups:
      - ""
    resources:
      - secrets
      - configmaps
    verbs:
      - get
      - list

---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: argocd-image-updater
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: argocd-image-updater
subjects:
  - kind: ServiceAccount
    name: argocd-image-updater
    namespace: argocd

---
apiVersion: v1
kind: ConfigMap
metadata:
  name: argocd-image-updater-config
  namespace: argocd
data:
  log.level: info
  git.user: "argocd-updater"
  git.email: "argocd-updater@example.com"
  argocd.server.insecure: "false"
  argocd.grpc.web: "true"

---
apiVersion: v1
kind: Secret
metadata:
  name: git-credentials
  namespace: argocd
type: Opaque
stringData:
  git.token: "your-github-token"  # GitHub PAT with push access

---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: argocd-image-updater
  namespace: argocd
  labels:
    app.kubernetes.io/name: argocd-image-updater
    app.kubernetes.io/part-of: argocd
spec:
  replicas: 1
  selector:
    matchLabels:
      app.kubernetes.io/name: argocd-image-updater
  template:
    metadata:
      labels:
        app.kubernetes.io/name: argocd-image-updater
    spec:
      serviceAccountName: argocd-image-updater
      containers:
      - name: argocd-image-updater
        image: argoproj/argocd-image-updater:v0.12.2
        imagePullPolicy: Always
        env:
        - name: ARGOCD_GRPC_WEB
          value: "true"
        - name: ARGOCD_SERVER
          value: "argocd-server.argocd"
        - name: GIT_TOKEN
          valueFrom:
            secretKeyRef:
              name: git-credentials
              key: git.token
        volumeMounts:
        - name: config
          mountPath: /etc/argocd-image-updater
        - name: ssh-keys
          mountPath: /home/argocd-image-updater/.ssh
      volumes:
      - name: config
        configMap:
          name: argocd-image-updater-config
      - name: ssh-keys
        secret:
          secretName: argocd-ssh-keys
          defaultMode: 0600
```

### STEP 6: Configure Image Update Rules

Add annotations to your Application manifest (or deployment) to tell Image Updater which images to watch:

Edit `argocd/applications/app.yaml`:

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: letsgo-app
  namespace: argocd
  annotations:
    # Image update configuration
    argocd-image-updater.argoproj.io/image-list: backend=your-registry/backend,frontend=your-registry/frontend
    
    # Write updates back to Git
    argocd-image-updater.argoproj.io/git-branch: main
    
    # Only update semantic version tags
    argocd-image-updater.argoproj.io/backend.update-strategy: semver
    argocd-image-updater.argoproj.io/backend.allow-tags: regexp:^v[0-9]+\.[0-9]+\.[0-9]+$
    
    argocd-image-updater.argoproj.io/frontend.update-strategy: semver
    argocd-image-updater.argoproj.io/frontend.allow-tags: regexp:^v[0-9]+\.[0-9]+\.[0-9]+$
    
    # Update kustomization.yaml with new tags
    argocd-image-updater.argoproj.io/kustomize.enabled: "true"
spec:
  # ... rest of Application spec
```

### STEP 7: Configure Registry Access (for private registries)

Create `argocd/config/secret-registries.yaml`:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: registry-credentials
  namespace: argocd
type: kubernetes.io/dockercfg
stringData:
  .dockercfg: |
    {
      "your-registry.azurecr.io": {
        "auth": "base64-encoded-credentials"
      }
    }
```

## How Image Drift Detection Works

### Timeline of Events

```
T=0
├─ Developer pushes new Docker image
│  └─ Image tagged: your-registry/backend:v1.2.5
│
T=10s
├─ ArgoCD Image Updater polls registry (every 2 min by default)
│  └─ Detects new image v1.2.5
│
T=20s
├─ Image Updater checks kustomization.yaml
│  └─ Current tag: v1.0.0 (drift detected!)
│
T=25s
├─ Image Updater clones Git repo
├─ Updates manifests/base/kustomization.yaml
│  └─ Changes: newTag: v1.0.0 → v1.2.5
├─ Commits and pushes to Git
│  └─ Commit: "auto: update backend image to v1.2.5"
│
T=35s
├─ ArgoCD detects Git change (polls every 3 sec by default)
│  └─ Drift detected between Git and cluster!
│
T=40s
├─ ArgoCD automatically syncs (auto-sync enabled)
│  └─ Fetches new manifest with v1.2.5
├─ Applies deployment to cluster
│  └─ Kubernetes pulls new image
│
T=60s
├─ New pod starts with v1.2.5
├─ Old pod terminates (rolling update)
│  └─ Zero downtime!
│
Deployed: ✓ Backend v1.2.5
```

### Drift Detection Configuration

Update `manifests/base/kustomization.yaml`:

```yaml
images:
  - name: backend
    newName: your-registry/backend
    newTag: v1.0.0  # ← Image Updater modifies this

  - name: frontend
    newName: your-registry/frontend
    newTag: v1.0.0  # ← Image Updater modifies this
```

When Image Updater detects a new image, it:
1. Parses `kustomization.yaml`
2. Compares remote registry tag vs `newTag`
3. If different → commits updated `newTag` to Git
4. ArgoCD detects the Git change
5. Automatically re-syncs and deploys

## Update Strategies

### Strategy 1: Semantic Versioning (Recommended for Production)

Only update to compatible semver versions:

```yaml
annotations:
  argocd-image-updater.argoproj.io/backend.update-strategy: semver
  argocd-image-updater.argoproj.io/backend.semver-constraint: "~1.2"  # Only 1.2.x
```

### Strategy 2: Latest Tag

Always update to latest:

```yaml
annotations:
  argocd-image-updater.argoproj.io/backend.update-strategy: latest
```

### Strategy 3: Alphabetical/Regex

Match specific patterns:

```yaml
annotations:
  argocd-image-updater.argoproj.io/backend.update-strategy: regexp
  argocd-image-updater.argoproj.io/backend.allow-tags: regexp:^v[0-9]+\.[0-9]+\.[0-9]+$
```

### Strategy 4: Manual (No Auto-Update)

Only use existing tags, never auto-update:

```yaml
annotations:
  argocd-image-updater.argoproj.io/backend.update-strategy: none
```

## Git Integration

### GitHub Setup

1. Create Personal Access Token (PAT):
   - Go to Settings → Developer settings → Personal access tokens
   - Scopes: `repo`, `read:packages`

2. Store in Kubernetes Secret:
   ```bash
   kubectl create secret generic git-credentials \
     --from-literal=git.token=ghp_xxxxxxxxxxxx \
     -n argocd
   ```

3. Configure in Image Updater:
   ```yaml
   env:
   - name: GIT_TOKEN
     valueFrom:
       secretKeyRef:
         name: git-credentials
         key: git.token
   ```

### GitLab Setup

```bash
kubectl create secret generic gitlab-credentials \
  --from-literal=git.token=glpat-xxxxxxxxxxxx \
  -n argocd
```

## Monitoring and Debugging

### Check Image Updater Logs

```bash
kubectl logs -n argocd deployment/argocd-image-updater -f
```

### Check ArgoCD Application Sync Status

```bash
argocd app get letsgo-app
argocd app sync letsgo-app              # Manual sync
argocd app history letsgo-app           # Sync history
```

### Check Drift Status

```bash
kubectl get application -n argocd letsgo-app -o yaml | grep phase
```

### Manual Image Update (without Image Updater)

Edit `manifests/base/kustomization.yaml`:

```yaml
images:
  - name: backend
    newName: your-registry/backend
    newTag: v1.2.5  # Change this
```

Then:
```bash
git add manifests/base/kustomization.yaml
git commit -m "Update backend to v1.2.5"
git push
# ArgoCD detects and syncs automatically
```

## Production Checklist

- [ ] ArgoCD installed and secured (TLS, RBAC)
- [ ] Image Updater installed with proper credentials
- [ ] Git repository with proper branch protection
- [ ] Notifications configured (Slack, email, webhooks)
- [ ] Backup strategy for persistent volumes
- [ ] Resource quotas and network policies
- [ ] Monitoring/alerting for ArgoCD health
- [ ] Rollback procedure documented
- [ ] Test failover scenarios
- [ ] Access control (RBAC) for ArgoCD UI/API

## Common Issues and Solutions

### Issue: Image Updater not detecting new images
**Solution:** Check Image Updater logs, verify registry credentials, ensure annotations on Application

### Issue: ArgoCD not syncing after image update
**Solution:** Check git.token secret, verify Git credentials have push access, check ArgoCD logs

### Issue: Credentials not working for private registry
**Solution:** Create docker config secret, mount as volume in Image Updater

### Issue: Too many commits in Git
**Solution:** Use commit batching or increase polling interval

## Cleanup

```bash
# Remove Image Updater
kubectl delete -f argocd/install/image-updater-install.yaml

# Remove ArgoCD Application
kubectl delete application letsgo-app -n argocd

# Remove ArgoCD
kubectl delete -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml -n argocd

# Remove namespace
kubectl delete namespace argocd
```
