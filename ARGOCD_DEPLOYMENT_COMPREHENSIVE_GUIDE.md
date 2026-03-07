# Argo CD Deployment Comprehensive Guide

This guide covers a full Argo CD deployment for this repository, including:
- Argo CD installation
- Application deployment from GitHub
- Automatic image update from Docker Hub using Argo CD Image Updater
- Validation and troubleshooting

It is aligned with the current repo files:
- `argocd-local-app.yaml`
- `argocd-image-updater.yaml`
- `kustomization.yaml`

## 1. Deployment Architecture

1. Code and manifests are stored in GitHub (`main` branch).
2. Argo CD watches `argocd-local-app.yaml` and syncs manifests to Kubernetes.
3. App source is Kustomize (`kustomization.yaml` at repo root).
4. Argo CD Image Updater checks Docker Hub for newer tags.
5. Image Updater updates the Argo Application spec (`write-back-method: argocd`).
6. Argo CD sync policy (`automated`) deploys new images automatically.

## 2. Prerequisites

- Kubernetes cluster (local or cloud)
- `kubectl` configured to the target cluster
- Internet access from cluster nodes to:
  - `github.com`
  - `raw.githubusercontent.com`
  - `registry-1.docker.io`
- GitHub repository access
- Docker Hub account (and token if private images)

Verify tooling:

```powershell
kubectl version --client
kubectl config current-context
kubectl get nodes
```

## 3. Key Repo Files

- `argocd-local-app.yaml`
  - Argo CD `Application`
  - image updater annotations
  - automated sync options
- `argocd-image-updater.yaml`
  - ServiceAccount, RBAC, ConfigMap, secret template, deployment
- `kustomization.yaml`
  - Kustomize root used by Argo app source type `Kustomize`

## 4. Install Argo CD

```powershell
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
kubectl -n argocd get pods
```

Wait until all Argo CD pods are `Running`.

## 5. Install ImageUpdater CRD (Required)

The installed image updater version requires `ImageUpdater` CRD presence.

```powershell
kubectl apply -f https://raw.githubusercontent.com/argoproj-labs/argocd-image-updater/master/config/crd/bases/argocd-image-updater.argoproj.io_imageupdaters.yaml
kubectl api-resources | Select-String imageupdaters
```

Expected output contains:
- `imageupdaters.argocd-image-updater.argoproj.io`

## 6. Configure Docker Hub Credentials

Update real credentials in the cluster secret (recommended command instead of editing YAML in-place):

```powershell
kubectl -n argocd create secret generic dockerhub-credentials `
  --from-literal=credentials="<dockerhub-username>:<dockerhub-token-or-password>" `
  --dry-run=client -o yaml | kubectl apply -f -
```

Notes:
- For public images, this can still help avoid anonymous pull limits.
- Use token instead of password when possible.

## 7. Deploy Image Updater Components

```powershell
kubectl apply -f argocd-image-updater.yaml
kubectl -n argocd rollout restart deploy/argocd-image-updater
kubectl -n argocd get pods -l app.kubernetes.io/name=argocd-image-updater
```

Expected:
- pod is `Running`

## 8. Deploy Argo Application

```powershell
kubectl apply -f argocd-local-app.yaml
kubectl -n argocd annotate application letsgo-app-local argocd.argoproj.io/refresh=hard --overwrite
kubectl -n argocd get application letsgo-app-local -o jsonpath="{.status.sourceType}{' | '}{.status.sync.status}{' | '}{.status.health.status}"
```

Expected:
- `Kustomize | Synced | Healthy`

## 9. Verify Image Automation

Check updater logs:

```powershell
kubectl -n argocd logs deploy/argocd-image-updater --tail=200
```

Healthy indicators:
- `considering 1 annotated application(s) for update`
- `Processing results: ... errors=0`
- `Successfully updated the live application spec` (when a newer image is found)

Current annotation strategy in `argocd-local-app.yaml`:
- `write-back-method: argocd`
- `update-strategy: newest-build`
- `allow-tags: regexp:^latest$`

## 10. End-to-End Update Flow

1. Build and push image to Docker Hub (for backend/frontend).
2. Ensure pushed tag matches allowed rule (`latest` in current setup).
3. Wait for Image Updater polling interval.
4. Image Updater patches Argo Application spec.
5. Argo CD sync deploys new image.

Manual force refresh:

```powershell
kubectl -n argocd annotate application letsgo-app-local argocd.argoproj.io/refresh=hard --overwrite
```

## 11. Operational Checks

### Argo CD status

```powershell
kubectl -n argocd get application letsgo-app-local -o wide
kubectl -n argocd get pods
```

### Workload status

```powershell
kubectl -n default get deploy,svc,pods
```

### Sync history

```powershell
kubectl -n argocd get application letsgo-app-local -o yaml
```

## 12. Troubleshooting

### Error: `namespaces "argocd" not found`
Cause:
- Argo CD not installed in this cluster context.

Fix:
```powershell
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```

### Error: `ImagePullBackOff` for image updater
Cause:
- Invalid image repo/tag.

Fix:
- Use known working image from this repo config:
  - `quay.io/argoprojlabs/argocd-image-updater:v0.15.0`

### Error: `no matches for kind "ImageUpdater"`
Cause:
- Missing CRD.

Fix:
```powershell
kubectl apply -f https://raw.githubusercontent.com/argoproj-labs/argocd-image-updater/master/config/crd/bases/argocd-image-updater.argoproj.io_imageupdaters.yaml
```

### Error: `skipping app ... type 'Directory'`
Cause:
- App source not Kustomize/Helm.

Fix:
- Ensure `kustomization.yaml` exists at app path.
- Ensure Argo app `source.path` points to that location.

### Error: `cannot use update strategy 'digest' ... without a version constraint`
Cause:
- `digest` strategy without explicit tag constraint.

Fix:
- Use `newest-build` strategy for latest-tag tracking.
- Or provide strict digest-compatible constraints.

### Error: `events is forbidden`
Cause:
- Missing RBAC for `events.create`.

Fix:
- Ensure ClusterRole includes `events` with `create` verb.

### Intermittent DNS errors to Docker Hub
Cause:
- Cluster DNS/network issue.

Fix:
- Validate DNS inside cluster.
- Retry after DNS recovery.
- Confirm outbound connectivity to `registry-1.docker.io`.

## 13. Security and Production Recommendations

- Replace plaintext secret placeholders immediately.
- Use Docker Hub access token, not account password.
- Restrict RBAC to minimum required scope (namespaced Role where possible).
- Pin image updater version (avoid floating `latest`).
- Store secrets in external secret manager (Vault/External Secrets) when available.
- Add monitoring/alerts for:
  - Argo app degraded
  - image updater errors > 0
  - sync failures

## 14. Recommended Deployment Commands (Quick Runbook)

```powershell
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
kubectl apply -f https://raw.githubusercontent.com/argoproj-labs/argocd-image-updater/master/config/crd/bases/argocd-image-updater.argoproj.io_imageupdaters.yaml
kubectl -n argocd create secret generic dockerhub-credentials --from-literal=credentials="<username>:<token>" --dry-run=client -o yaml | kubectl apply -f -
kubectl apply -f argocd-image-updater.yaml
kubectl apply -f argocd-local-app.yaml
kubectl -n argocd rollout restart deploy/argocd-image-updater
kubectl -n argocd annotate application letsgo-app-local argocd.argoproj.io/refresh=hard --overwrite
kubectl -n argocd get application letsgo-app-local -o jsonpath="{.status.sourceType}{' | '}{.status.sync.status}{' | '}{.status.health.status}"
```

## 15. Rollback

If a bad deployment occurs:

1. Roll back image tag in deployment manifests or Argo app image parameter.
2. Force refresh:

```powershell
kubectl -n argocd annotate application letsgo-app-local argocd.argoproj.io/refresh=hard --overwrite
```

3. Confirm pods recover:

```powershell
kubectl -n default get pods
```

---

If you want, I can also generate a second version of this guide as a one-page "production checklist" for your team to follow during each release.