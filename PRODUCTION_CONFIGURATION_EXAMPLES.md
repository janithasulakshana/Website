# Production Configuration Examples

## Environment-Specific Configurations

### Development Configuration

```yaml
# argocd/applications/dev-app.yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: letsgo-app-dev
  namespace: argocd
spec:
  project: development
  
  source:
    repoURL: https://github.com/your-org/k8s-manifests.git
    targetRevision: develop
    path: manifests/overlays/development
  
  destination:
    server: https://kubernetes.default.svc
    namespace: development
  
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    
  # Image Update Strategy: Latest (for dev)
  metadata:
    annotations:
      argocd-image-updater.argoproj.io/image-list: backend=your-registry/backend,frontend=your-registry/frontend
      argocd-image-updater.argoproj.io/backend.update-strategy: latest
      argocd-image-updater.argoproj.io/frontend.update-strategy: latest
```

### Staging Configuration

```yaml
# argocd/applications/staging-app.yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: letsgo-app-staging
  namespace: argocd
spec:
  project: staging
  
  source:
    repoURL: https://github.com/your-org/k8s-manifests.git
    targetRevision: main
    path: manifests/overlays/staging
  
  destination:
    server: https://kubernetes.default.svc
    namespace: staging
  
  syncPolicy:
    automated:
      prune: false  # Be more conservative in staging
      selfHeal: true
  
  metadata:
    annotations:
      argocd-image-updater.argoproj.io/image-list: backend=your-registry/backend,frontend=your-registry/frontend
      # Allow minor version updates in staging
      argocd-image-updater.argoproj.io/backend.update-strategy: semver
      argocd-image-updater.argoproj.io/backend.semver-constraint: "^1.0"
      argocd-image-updater.argoproj.io/frontend.update-strategy: semver
      argocd-image-updater.argoproj.io/frontend.semver-constraint: "^1.0"
```

### Production Configuration (CONSERVATIVE)

```yaml
# argocd/applications/prod-app.yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: letsgo-app-prod
  namespace: argocd
spec:
  project: production
  
  source:
    repoURL: https://github.com/your-org/k8s-manifests.git
    targetRevision: release
    path: manifests/overlays/production
  
  destination:
    server: https://kubernetes.default.svc
    namespace: production
  
  syncPolicy:
    # Be very conservative with production
    automated:
      prune: false      # Never delete orphaned resources
      selfHeal: false   # Don't auto-correct drift (manual review required)
    syncOptions:
      - RespectIgnoreDifferences=true
  
  metadata:
    annotations:
      argocd-image-updater.argoproj.io/image-list: backend=your-registry/backend,frontend=your-registry/frontend
      # Only patch version updates (1.0.0 → 1.0.1)
      argocd-image-updater.argoproj.io/backend.update-strategy: semver
      argocd-image-updater.argoproj.io/backend.semver-constraint: "~1.0"
      argocd-image-updater.argoproj.io/backend.allow-tags: regexp:^v[0-9]+\.[0-9]+\.[0-9]+$
      
      argocd-image-updater.argoproj.io/frontend.update-strategy: semver
      argocd-image-updater.argoproj.io/frontend.semver-constraint: "~1.0"
      argocd-image-updater.argoproj.io/frontend.allow-tags: regexp:^v[0-9]+\.[0-9]+\.[0-9]+$
      
      # Require manual approval via pull requests
      argocd-image-updater.argoproj.io/git-branch: main
```

## AppProject Configurations

```yaml
---
# Development Project
apiVersion: argoproj.io/v1alpha1
kind: AppProject
metadata:
  name: development
  namespace: argocd
spec:
  description: Development environment (auto-deploy everything)
  sourceRepos:
    - "https://github.com/your-org/k8s-manifests.git"
  destinations:
    - namespace: "development"
      server: "https://kubernetes.default.svc"
  clusterResourceWhitelist:
    - group: "*"
      kind: "*"

---
# Staging Project
apiVersion: argoproj.io/v1alpha1
kind: AppProject
metadata:
  name: staging
  namespace: argocd
spec:
  description: Staging environment (conservative updates)
  sourceRepos:
    - "https://github.com/your-org/k8s-manifests.git"
  destinations:
    - namespace: "staging"
      server: "https://kubernetes.default.svc"
  clusterResourceWhitelist:
    - group: "*"
      kind: "*"

---
# Production Project (Most Restrictive)
apiVersion: argoproj.io/v1alpha1
kind: AppProject
metadata:
  name: production
  namespace: argocd
spec:
  description: Production environment (manual approval required)
  sourceRepos:
    - "https://github.com/your-org/k8s-manifests.git"
  destinations:
    - namespace: "production"
      server: "https://kubernetes.default.svc"
  clusterResourceWhitelist:
    - group: "*"
      kind: "*"
  clusterResourceBlacklist:
    - group: ""
      kind: "Namespace"
    - group: ""
      kind: "ResourceQuota"
    - group: ""
      kind: "NetworkPolicy"
```

## Kustomize Overlay Examples

### Production Overlay

```yaml
# manifests/overlays/production/kustomization.yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

namespace: production

bases:
  - ../../base

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

commonLabels:
  environment: production
  tier: prod

patchesStrategicMerge:
  - resource-limits-patch.yaml
  - pod-disruption-budget-patch.yaml

patchesJson6902:
  - target:
      group: apps
      version: v1
      kind: Deployment
      name: backend
    patch: |-
      - op: replace
        path: /spec/strategy/rollingUpdate/maxUnavailable
        value: 0
      - op: replace
        path: /spec/strategy/rollingUpdate/maxSurge
        value: 1
```

### Production Resource Limits Patch

```yaml
# manifests/overlays/production/resource-limits-patch.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
spec:
  template:
    spec:
      containers:
      - name: backend
        resources:
          requests:
            cpu: "500m"
            memory: "512Mi"
          limits:
            cpu: "1000m"
            memory: "1Gi"
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
spec:
  template:
    spec:
      containers:
      - name: frontend
        resources:
          requests:
            cpu: "250m"
            memory: "256Mi"
          limits:
            cpu: "500m"
            memory: "512Mi"
```

### Pod Disruption Budget Patch

```yaml
# manifests/overlays/production/pod-disruption-budget-patch.yaml
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: backend-pdb
spec:
  maxUnavailable: 1
  selector:
    matchLabels:
      app: backend
---
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: frontend-pdb
spec:
  maxUnavailable: 1
  selector:
    matchLabels:
      app: frontend
```

## RBAC for Image Updater (Production)

```yaml
# argocd/config/rbac-production.yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: argocd-image-updater-prod
  namespace: argocd
rules:
  - apiGroups:
      - argoproj.io
    resources:
      - applications
    verbs:
      - get
      - list
      - watch
    resourceNames:
      - letsgo-app-prod  # Only this application
  - apiGroups:
      - ""
    resources:
      - secrets
      - configmaps
    verbs:
      - get

---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: argocd-image-updater-prod
  namespace: argocd
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: Role
  name: argocd-image-updater-prod
subjects:
  - kind: ServiceAccount
    name: argocd-image-updater
    namespace: argocd
```

## Network Policy for Production

```yaml
# argocd/config/network-policy.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: argocd-image-updater-policy
  namespace: argocd
spec:
  podSelector:
    matchLabels:
      app.kubernetes.io/name: argocd-image-updater
  policyTypes:
    - Ingress
    - Egress
  ingress:
    - from:
        - podSelector:
            matchLabels:
              app.kubernetes.io/name: argocd-server
  egress:
    # Allow DNS
    - to:
        - namespaceSelector: {}
      ports:
        - protocol: UDP
          port: 53
    # Allow registry access
    - to:
        - namespaceSelector: {}
      ports:
        - protocol: TCP
          port: 443
    # Allow Git access
    - to:
        - namespaceSelector: {}
      ports:
        - protocol: TCP
          port: 22
        - protocol: TCP
          port: 443
```

## Monitoring & Alerts (Prometheus)

```yaml
# argocd/config/service-monitor.yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: argocd-image-updater
  namespace: argocd
spec:
  selector:
    matchLabels:
      app.kubernetes.io/name: argocd-image-updater
  endpoints:
    - port: metrics
      interval: 30s

---
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: argocd-image-updater-alerts
  namespace: argocd
spec:
  groups:
    - name: argocd-image-updater
      interval: 60s
      rules:
        - alert: ImageUpdaterDown
          expr: up{job="argocd-image-updater"} == 0
          for: 5m
          annotations:
            summary: "Image Updater is down"
        
        - alert: ImageUpdaterHighErrorRate
          expr: rate(argocd_image_updater_errors_total[5m]) > 0.1
          annotations:
            summary: "Image Updater has high error rate"
        
        - alert: DriftDetectionFailed
          expr: argocd_image_updater_sync_failures_total > 10
          for: 10m
          annotations:
            summary: "Drift detection failing repeatedly"
```

## Backup Strategy

```bash
#!/bin/bash
# Backup ArgoCD configuration and secrets

BACKUP_DIR="argocd-backups-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Backup applications
kubectl get application -n argocd -o yaml > "$BACKUP_DIR/applications.yaml"

# Backup secrets
kubectl get secret -n argocd -o yaml > "$BACKUP_DIR/secrets.yaml"

# Backup configmaps
kubectl get configmap -n argocd -o yaml > "$BACKUP_DIR/configmaps.yaml"

# Backup to S3 (optional)
aws s3 cp --recursive "$BACKUP_DIR" s3://your-backup-bucket/argocd/

echo "Backup created: $BACKUP_DIR"
```

## Testing Strategy

### Test in Dev First
```bash
# 1. Deploy to development with latest strategy
kubectl apply -f argocd/applications/dev-app.yaml

# 2. Test image updates
docker push your-registry/backend:latest

# 3. Verify auto-deployment
kubectl logs -n argocd deployment/argocd-image-updater -f

# 4. Validate pods updated
kubectl get pods -l app=backend -w
```

### Test in Staging Before Prod
```bash
# 1. Deploy to staging with minor version updates
kubectl apply -f argocd/applications/staging-app.yaml

# 2. Test semver constraints
docker push your-registry/backend:v1.1.0

# 3. Verify controlled updates
argocd app get letsgo-app-staging --refresh
```

### Production Deployment
```bash
# 1. Manually trigger and review
git commit -m "Release v1.0.0"
git push

# 2. Monitor deployment
kubectl get pods -n production -w

# 3. Run health checks
./run-tests.sh

# 4. Keep rollback ready
git log --oneline  # For quick rollback if needed
```
