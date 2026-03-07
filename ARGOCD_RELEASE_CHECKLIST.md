# Argo CD Release Checklist

Use this one-page checklist before and during each release.

## 1. Pre-Flight Checks

- [ ] Confirm cluster context is correct:
```powershell
kubectl config current-context
```
- [ ] Confirm Argo CD namespace exists:
```powershell
kubectl get ns argocd
```
- [ ] Confirm Argo CD core is healthy:
```powershell
kubectl -n argocd get pods
```
- [ ] Confirm application is healthy and synced:
```powershell
kubectl -n argocd get application letsgo-app-local -o jsonpath="{.status.sourceType}{' | '}{.status.sync.status}{' | '}{.status.health.status}"
```
Expected: `Kustomize | Synced | Healthy`
- [ ] Confirm Image Updater pod is running:
```powershell
kubectl -n argocd get pods -l app.kubernetes.io/name=argocd-image-updater
```
- [ ] Confirm no active updater errors in recent logs:
```powershell
kubectl -n argocd logs deploy/argocd-image-updater --tail=100
```

## 2. Image & Registry Checks

- [ ] Confirm target image tags are pushed to Docker Hub.
- [ ] Confirm app annotations still match policy:
  - `image-list` includes `:latest`
  - `update-strategy: newest-build`
  - `allow-tags: regexp:^latest$`
- [ ] Confirm cluster can resolve Docker Hub (no DNS failures in updater logs).

## 3. Release Execution

- [ ] Merge approved changes to `main`.
- [ ] Verify CI pipeline completed and images pushed.
- [ ] Force Argo refresh (optional):
```powershell
kubectl -n argocd annotate application letsgo-app-local argocd.argoproj.io/refresh=hard --overwrite
```
- [ ] Watch deployment state:
```powershell
kubectl -n default get deploy,po -w
```

## 4. Post-Release Validation

- [ ] Verify app remains `Synced` and `Healthy`.
- [ ] Verify backend API health:
```powershell
kubectl -n default get svc
# If exposed externally, test /api/test endpoint
```
- [ ] Verify frontend is accessible and using expected backend.
- [ ] Verify no new errors in Argo CD or Image Updater logs.

## 5. Rollback Checklist

- [ ] Identify last known-good image/tag.
- [ ] Revert deployment image source (manifest or app image override).
- [ ] Trigger hard refresh:
```powershell
kubectl -n argocd annotate application letsgo-app-local argocd.argoproj.io/refresh=hard --overwrite
```
- [ ] Confirm workloads recover:
```powershell
kubectl -n default get pods
```
- [ ] Revalidate service health and user-critical paths.

## 6. Release Sign-Off

- [ ] Functional smoke test passed.
- [ ] No degraded resources in `argocd` and `default` namespaces.
- [ ] Monitoring and alerts normal.
- [ ] Release notes updated.
