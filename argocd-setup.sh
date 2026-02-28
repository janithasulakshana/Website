#!/bin/bash
# Setup ArgoCD with Image Updater for LetsGo Application

set -e

echo "=== ArgoCD Setup Script ==="
echo ""

# Step 1: Create namespace
echo "[1] Creating ArgoCD namespace..."
kubectl create namespace argocd --dry-run=client -o yaml | kubectl apply -f -
echo "✓ Namespace created"

# Step 2: Install ArgoCD
echo ""
echo "[2] Installing ArgoCD..."
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
echo "✓ ArgoCD installed"

# Step 3: Wait for ArgoCD to be ready
echo ""
echo "[3] Waiting for ArgoCD to be ready (this may take 2-3 minutes)..."
kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=argocd-server -n argocd --timeout=300s
echo "✓ ArgoCD ready"

# Step 4: Get initial admin password
echo ""
echo "[4] ArgoCD Initial Admin Password:"
INITIAL_PASSWORD=$(kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d)
echo "Password: $INITIAL_PASSWORD"
echo ""
echo "⚠ Change this password immediately after first login!"

# Step 5: Port forward
echo ""
echo "[5] Access ArgoCD UI:"
echo "kubectl port-forward svc/argocd-server -n argocd 8080:443"
echo ""
echo "Then visit: https://localhost:8080"
echo "Username: admin"
echo "Password: (from above)"

# Step 6: Install Image Updater
echo ""
echo "[6] Installing ArgoCD Image Updater..."
read -p "Continue? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Update credentials in argocd-image-updater.yaml
    echo "⚠ Update Git token in argocd-image-updater.yaml before deploying!"
    echo "  Replace: ghp_YOUR_GITHUB_TOKEN_HERE"
    read -p "Have you updated the token? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        kubectl apply -f argocd-image-updater.yaml
        echo "✓ Image Updater installed"
        echo ""
        echo "Verify installation:"
        echo "  kubectl logs -n argocd deployment/argocd-image-updater -f"
    fi
fi

# Step 7: Update Application manifest
echo ""
echo "[7] Update argocd-application.yaml:"
echo "  - Change GitHub repository URL"
echo "  - Change image registry URLs"
echo "  - Customize update strategies"

# Step 8: Create Git repository structure
echo ""
echo "[8] Initialize Git repository structure:"
echo ""
echo "mkdir -p manifests/base manifests/overlays/{dev,prod}"
echo "cp *-deployment.yaml manifests/base/"
echo "cp *-service.yaml manifests/base/"
echo "cp configmap.yaml secret.yaml storage.yaml ingress.yaml manifests/base/"
echo "cp manifests-base-kustomization.yaml manifests/base/kustomization.yaml"
echo ""
echo "git init"
echo "git add ."
echo "git commit -m 'Initial commit: Kubernetes manifests for ArgoCD'"
echo "git remote add origin https://github.com/YOUR_ORG/k8s-manifests.git"
echo "git push -u origin main"

# Step 9: Deploy Application
echo ""
echo "[9] Deploy ArgoCD Application:"
echo "kubectl apply -f argocd-application.yaml"
echo ""

echo ""
echo "=== Setup Complete ==="
echo ""
echo "Next Steps:"
echo "1. Configure Git repository (update URLs in manifests)"
echo "2. Push manifests to Git repository"
echo "3. Deploy ArgoCD Application"
echo "4. Monitor sync status: argocd app get letsgo-app"
echo "5. Push new Docker images and watch automatic deployment!"
