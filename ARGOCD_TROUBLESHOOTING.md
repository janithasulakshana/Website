# ArgoCD Image Updater Troubleshooting Guide

## Common Issues and Solutions

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

# Common log messages:
# ✓ "Polling registry..." → working fine
# ✗ "Failed to authenticate" → credential issue
# ✗ "Image not found" → wrong image name
```

**Solutions:**

1. **Verify Git token is valid**
   ```bash
   # Check secret exists
   kubectl get secret -n argocd git-credentials
   
   # Verify token isn't expired
   # GitHub tokens default to 30 days. Regenerate if needed.
   ```

2. **Check Application annotations**
   ```bash
   kubectl get application -n argocd letsgo-app -o yaml | grep image-list
   
   # Should show:
   # argocd-image-updater.argoproj.io/image-list: backend=...,frontend=...
   ```

3. **Verify image names match exactly**
   ```yaml
   # kustomization.yaml
   images:
     - name: backend
       newName: your-registry/backend  # ← Must match image-list
   
   # Application annotations
   argocd-image-updater.argoproj.io/image-list: backend=your-registry/backend
   #                                             ↑       ↑
   #                                             Same!
   ```

4. **Check registry credentials**
   ```bash
   # Private registry?
   kubectl get secret -n argocd private-registry-credentials
   
   # Must be referenced in image-updater config
   kubectl get configmap -n argocd argocd-image-updater-config -o yaml
   ```

5. **Increase polling interval temporarily**
   ```bash
   # Edit deployment to add debug logging
   kubectl edit deployment -n argocd argocd-image-updater
   
   # Add env var:
   - name: IMAGE_UPDATER_LOG_LEVEL
     value: "debug"
   ```

---

### Issue 2: Image Updater Running But Git Not Updating

**Symptoms:**
- Image Updater logs show new image detected
- No commits appear in Git repository
- ArgoCD doesn't sync new version

**Diagnosis:**

```bash
# Check Git token issue
kubectl logs -n argocd deployment/argocd-image-updater | grep -i "auth\|token\|credential"

# Typical errors:
# "Failed to push to repository"
# "Authentication failed"
# "Permission denied"
```

**Solutions:**

1. **Verify Git token has correct permissions**
   ```bash
   # For GitHub:
   # Token must have: repo, read:packages scopes
   # Check on GitHub: Settings → Developer settings → Personal access tokens
   
   # Regenerate if needed:
   # Delete old token
   # Create new token with correct scopes
   # Update secret:
   kubectl create secret generic git-credentials \
     --from-literal=git.token=ghp_xxxx \
     -n argocd --dry-run=client -o yaml | kubectl apply -f -
   
   # Restart Image Updater
   kubectl rollout restart deployment -n argocd argocd-image-updater
   ```

2. **Check Git repository branch**
   ```yaml
   # In Application manifest
   annotations:
     argocd-image-updater.argoproj.io/git-branch: main
   
   # Verify main branch exists and is correct
   git branch -a
   ```

3. **Verify Git repository URL**
   ```yaml
   # In Application spec
   source:
     repoURL: https://github.com/your-org/k8s-manifests.git
   
   # Test access:
   git clone https://github.com/your-org/k8s-manifests.git
   ```

4. **Check write permissions**
   ```bash
   # Token user must be able to push
   # Check on GitHub:
   # Repository → Settings → Collaborators
   # Or for org repo: Organization → Members
   
   # If using SSH:
   kubectl get secret -n argocd argocd-ssh-keys
   ```

5. **Enable verbose logging**
   ```bash
   kubectl set env deployment/argocd-image-updater \
     -n argocd \
     IMAGE_UPDATER_LOG_LEVEL=debug
   
   # Wait for new pod to start
   kubectl logs -n argocd deployment/argocd-image-updater -f
   ```

---

### Issue 3: ArgoCD Not Syncing After Git Update

**Symptoms:**
- Git repository has new image tag
- ArgoCD still shows old image running
- Status: OutOfSync but not syncing

**Diagnosis:**

```bash
# Check Application status
argocd app get letsgo-app

# Check if auto-sync is enabled
kubectl get application -n argocd letsgo-app -o yaml | grep -A 5 syncPolicy

# Common issues:
# syncPolicy.automated: null/missing → not auto-syncing
# status: OutOfSync, message: "Sync not enabled"
```

**Solutions:**

1. **Enable auto-sync in Application**
   ```yaml
   spec:
     syncPolicy:
       automated:
         prune: true
         selfHeal: true
   ```

2. **Manual sync (workaround)**
   ```bash
   argocd app sync letsgo-app
   
   # With specific revision
   argocd app sync letsgo-app --revision HEAD
   ```

3. **Check ArgoCD server health**
   ```bash
   kubectl get pods -n argocd
   
   # All pods should be Running
   # If any are failing:
   kubectl logs -n argocd <pod-name>
   ```

4. **Force app refresh**
   ```bash
   argocd app get letsgo-app --refresh
   
   # Wait a moment, then:
   argocd app get letsgo-app
   
   # Status should change to OutOfSync if drift exists
   ```

5. **Check sync error messages**
   ```bash
   kubectl describe application -n argocd letsgo-app | grep -A 10 Status
   ```

---

### Issue 4: Image Updater Can't Authenticate to Private Registry

**Symptoms:**
- Private Docker registry (not Docker Hub)
- Image Updater logs: "Failed to pull image: unauthorized"
- "Access denied" errors

**Diagnosis:**

```bash
# Check registry credentials
kubectl get secret -n argocd private-registry-credentials -o yaml

# Verify it's referenced in config
kubectl get configmap -n argocd argocd-image-updater-config -o yaml | grep -i "registries\|credentials"
```

**Solutions:**

1. **Create registry credentials secret**
   ```bash
   kubectl create secret generic private-registry-credentials \
     --from-literal=username=myuser \
     --from-literal=password=mypassword \
     -n argocd
   ```

2. **Update Image Updater config**
   ```yaml
   # In argocd-image-updater-config ConfigMap
   data:
     registries.conf: |
       registries:
       - name: Private Registry
         prefix: your-registry.com
         api_url: https://your-registry.com
         credentials: secret:private-registry-credentials#username,secret:private-registry-credentials#password
   ```

3. **Restart Image Updater**
   ```bash
   kubectl rollout restart deployment -n argocd argocd-image-updater
   ```

4. **Test manually**
   ```bash
   # Port-forward to Image Updater pod
   kubectl port-forward -n argocd <image-updater-pod> 8080:8080
   
   # Check metrics
   curl localhost:8080/metrics
   ```

---

### Issue 5: Kustomization.yaml Not Being Updated

**Symptoms:**
- Image Updater logs show "Update successful"
- But kustomization.yaml in Git hasn't changed
- Image tag still old

**Diagnosis:**

```bash
# Check write-back configuration
kubectl get application -n argocd letsgo-app -o yaml | grep write-back

# Should show:
# argocd-image-updater.argoproj.io/write-back-method: kustomize
# argocd-image-updater.argoproj.io/write-back-target: kustomization.yaml
```

**Solutions:**

1. **Verify kustomization.yaml exists in correct path**
   ```bash
   # Should be in the Application source path
   # Example: manifests/base/kustomization.yaml
   
   git ls-tree -r HEAD manifests/base/ | grep kustomization
   ```

2. **Check file format**
   ```yaml
   # Correct format (must have apiVersion and kind)
   apiVersion: kustomize.config.k8s.io/v1beta1
   kind: Kustomization
   
   images:
     - name: backend
       newName: your-registry/backend
       newTag: v1.0.0
   
   # Wrong format (missing apiVersion/kind)
   # resources:
   # - deployment.yaml
   ```

3. **Update Application with correct path**
   ```bash
   kubectl patch application letsgo-app -n argocd --type json -p='
   [
     {"op": "replace", "path": "/spec/source/path", "value": "manifests/base"}
   ]'
   ```

4. **Test write permission to file**
   ```bash
   # Try manual Git push from Image Updater pod
   kubectl exec -it -n argocd deployment/argocd-image-updater -- \
     git clone <repo> && cd <repo> && git config user.name "test" && git config user.email "test@test.com"
   ```

---

### Issue 6: Too Many Git Commits (Spam)

**Symptoms:**
- Git repository flooded with commits
- "auto: update..." commits every minute
- Hard to track real changes

**Diagnosis:**

```bash
# Check polling interval
kubectl get configmap -n argocd argocd-image-updater-config -o yaml | grep "poll"

# Check for repeated image updates
git log --oneline | grep "auto: update" | wc -l
```

**Causes:**
1. Polling interval too low (< 2 min)
2. Image tag keeps changing (e.g., "latest" tag changing constantly)
3. Multiple Image Updaters running (duplicate instances)

**Solutions:**

1. **Increase polling interval**
   ```yaml
   data:
     registries.poll-interval: "5m"  # Default 2m, increase to 5m
   ```

2. **Use stable tags instead of "latest"**
   ```yaml
   # Bad (changes often):
   argocd-image-updater.argoproj.io/backend.allow-tags: regexp:.*
   
   # Good (only semantic versions):
   argocd-image-updater.argoproj.io/backend.allow-tags: regexp:^v[0-9]+\.[0-9]+\.[0-9]+$
   ```

3. **Verify only one Image Updater instance**
   ```bash
   kubectl get deployment -n argocd | grep image-updater
   
   # Should be exactly 1
   # If multiple, delete extras
   ```

4. **Ignore non-version tags**
   ```yaml
   annotations:
     argocd-image-updater.argoproj.io/backend.ignore-tags: regex:latest|main|dev
   ```

---

### Issue 7: Pod Still Running Old Version After Git Update

**Symptoms:**
- Git has new image tag
- ArgoCD shows "Synced"
- But pod still running old image

**Diagnosis:**

```bash
# Check deployment image
kubectl get deployment backend -o jsonpath='{.spec.template.spec.containers[0].image}'

# Check pod image
kubectl get pod -o jsonpath='{.items[*].spec.containers[0].image}'

# If deployment has new image but pod doesn't:
# → Pod hasn't been recreated yet

# Check pod age
kubectl get pods -w
```

**Solutions:**

1. **Force pod restart**
   ```bash
   # Delete pod to trigger recreation
   kubectl delete pod -l app=backend
   
   # Or use rollout restart
   kubectl rollout restart deployment backend
   ```

2. **Check imagePullPolicy**
   ```yaml
   # Must be Always for dev, IfNotPresent for prod
   containers:
   - name: backend
     image: your-registry/backend:v1.0.1
     imagePullPolicy: Always  # ← Must pull new image
   ```

3. **Check image availability**
   ```bash
   # Verify image actually exists in registry
   docker pull your-registry/backend:v1.0.1
   ```

4. **Check image pull secrets**
   ```bash
   # If private registry:
   kubectl get secret -n default | grep docker
   ```

---

### Issue 8: Webhook Not Triggering Sync

**Symptoms:**
- Pushing to Git doesn't trigger ArgoCD sync immediately
- Have to wait 3+ minutes
- Want faster feedback

**Diagnosis:**

```bash
# GitHub webhook configuration
# Check repository Settings → Webhooks

# Should have webhook pointing to ArgoCD server
```

**Solutions:**

1. **Configure GitHub webhook**
   - Go to GitHub repo → Settings → Webhooks → Add webhook
   - Payload URL: `https://<argocd-server>/api/webhook`
   - Content type: `application/json`
   - Events: Push events
   - Active: ✓

2. **Get ArgoCD server URL**
   ```bash
   # Find external IP or DNS
   kubectl get ingress -n argocd
   
   # Or port-forward for testing
   kubectl port-forward svc/argocd-server -n argocd 443:443
   ```

3. **Test webhook**
   ```bash
   # Check ArgoCD logs for webhook events
   kubectl logs -n argocd deployment/argocd-server | grep webhook
   ```

---

## Quick Diagnosis Script

```bash
#!/bin/bash
# Save as: diagnose-argocd.sh

echo "=== ArgoCD Image Updater Diagnostics ==="
echo ""

echo "1. Image Updater Pod Status:"
kubectl get pods -n argocd | grep image-updater
echo ""

echo "2. Image Updater Logs (last 20 lines):"
kubectl logs -n argocd deployment/argocd-image-updater --tail=20
echo ""

echo "3. Git Token Secret:"
kubectl get secret -n argocd git-credentials -o jsonpath='{.metadata.name}'
echo ""

echo "4. Application Annotations:"
kubectl get application -n argocd letsgo-app -o jsonpath='{.metadata.annotations}' | jq
echo ""

echo "5. ArgoCD Application Status:"
argocd app get letsgo-app
echo ""

echo "6. Recent Git Commits:"
git log --oneline -10
echo ""

echo "=== End Diagnostics ==="
```

Run it:
```bash
bash diagnose-argocd.sh
```

---

## When Nothing Works: Full Reset

```bash
# Remove Image Updater
kubectl delete deployment -n argocd argocd-image-updater
kubectl delete configmap -n argocd argocd-image-updater-config
kubectl delete secret -n argocd git-credentials

# Delete Application
kubectl delete application -n argocd letsgo-app

# Re-apply Image Updater
kubectl apply -f argocd-image-updater.yaml

# Re-apply Application
kubectl apply -f argocd-application.yaml

# Verify
kubectl logs -n argocd deployment/argocd-image-updater -f
argocd app get letsgo-app
```

---

## Support Resources

- ArgoCD Docs: https://argo-cd.readthedocs.io/
- Image Updater Docs: https://argocd-image-updater.readthedocs.io/
- GitHub Issues: https://github.com/argoproj/argo-cd/issues
- Image Updater Issues: https://github.com/argoproj-labs/argocd-image-updater/issues
