#!/bin/bash
# Complete deployment script with all validation

set -e

echo "╔════════════════════════════════════════════════════════════╗"
echo "║   Complete ArgoCD + Image Updater Deployment Script        ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
GITHUB_TOKEN=${GITHUB_TOKEN:-""}
REGISTRY_URL=${REGISTRY_URL:-""}
GIT_REPO=${GIT_REPO:-""}
REGISTRY_USERNAME=${REGISTRY_USERNAME:-""}
REGISTRY_PASSWORD=${REGISTRY_PASSWORD:-""}

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_command() {
    if ! command -v $1 &> /dev/null; then
        log_error "$1 is not installed"
        exit 1
    fi
}

# Step 1: Pre-flight checks
echo ""
log_info "Running pre-flight checks..."
echo ""

check_command kubectl
log_success "kubectl found"

check_command git
log_success "git found"

check_command docker
log_success "docker found"

# Verify Kubernetes connectivity
if ! kubectl cluster-info &> /dev/null; then
    log_error "Cannot connect to Kubernetes cluster"
    exit 1
fi
log_success "Connected to Kubernetes cluster"

# Step 2: Get configuration
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║   Configuration Setup                                      ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

if [ -z "$GITHUB_TOKEN" ]; then
    read -p "Enter GitHub Personal Access Token: " GITHUB_TOKEN
fi

if [ -z "$GIT_REPO" ]; then
    read -p "Enter Git repository URL (https://github.com/...): " GIT_REPO
fi

if [ -z "$REGISTRY_URL" ]; then
    read -p "Enter Docker registry URL (e.g., your-registry.azurecr.io): " REGISTRY_URL
fi

# Step 3: Create namespace
echo ""
log_info "Creating argocd namespace..."
kubectl create namespace argocd --dry-run=client -o yaml | kubectl apply -f -
log_success "Namespace created"

# Step 4: Install ArgoCD
echo ""
log_info "Installing ArgoCD..."
log_warn "This may take a few minutes..."
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Wait for ArgoCD server to be ready
log_info "Waiting for ArgoCD to be ready (up to 5 minutes)..."
kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=argocd-server -n argocd --timeout=300s 2>/dev/null || true

# Get initial admin password
echo ""
log_info "Getting ArgoCD initial admin password..."
INITIAL_PASSWORD=$(kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" 2>/dev/null | base64 -d || echo "")

if [ -n "$INITIAL_PASSWORD" ]; then
    log_success "ArgoCD initial password: $INITIAL_PASSWORD"
    log_warn "⚠️  Change this password immediately after first login!"
else
    log_warn "Could not retrieve initial password. Check ArgoCD secrets manually."
fi

# Step 5: Create Git credentials secret
echo ""
log_info "Creating Git credentials secret..."
kubectl create secret generic git-credentials \
  --from-literal=git.token="$GITHUB_TOKEN" \
  -n argocd --dry-run=client -o yaml | kubectl apply -f -
log_success "Git credentials created"

# Step 6: Create registry credentials (if needed)
echo ""
read -p "Is your Docker registry private? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if [ -z "$REGISTRY_USERNAME" ]; then
        read -p "Registry username: " REGISTRY_USERNAME
    fi
    if [ -z "$REGISTRY_PASSWORD" ]; then
        read -sp "Registry password: " REGISTRY_PASSWORD
        echo
    fi
    
    kubectl create secret generic private-registry-credentials \
      --from-literal=username="$REGISTRY_USERNAME" \
      --from-literal=password="$REGISTRY_PASSWORD" \
      -n argocd --dry-run=client -o yaml | kubectl apply -f -
    log_success "Registry credentials created"
fi

# Step 7: Update and deploy Image Updater
echo ""
log_info "Deploying ArgoCD Image Updater..."

# Create a temporary file with updated values
TEMP_UPDATER=$(mktemp)
cat argocd-image-updater.yaml | sed "s|ghp_YOUR_GITHUB_TOKEN_HERE|$GITHUB_TOKEN|g" > "$TEMP_UPDATER"

kubectl apply -f "$TEMP_UPDATER"
rm "$TEMP_UPDATER"

log_success "Image Updater deployed"

# Step 8: Wait for Image Updater to be ready
echo ""
log_info "Waiting for Image Updater to be ready..."
kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=argocd-image-updater -n argocd --timeout=60s 2>/dev/null || true

# Step 9: Update and deploy Application
echo ""
log_info "Deploying ArgoCD Application..."

TEMP_APP=$(mktemp)
cat argocd-application.yaml | \
  sed "s|https://github.com/your-org/k8s-manifests.git|$GIT_REPO|g" | \
  sed "s|your-registry|$REGISTRY_URL|g" > "$TEMP_APP"

kubectl apply -f "$TEMP_APP"
rm "$TEMP_APP"

log_success "Application deployed"

# Step 10: Verification
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║   Verification                                             ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

log_info "Checking pods..."
kubectl get pods -n argocd

echo ""
log_info "Checking Application..."
kubectl get application -n argocd

echo ""
log_info "ArgoCD Image Updater logs (last 10 lines):"
kubectl logs -n argocd deployment/argocd-image-updater --tail=10 || log_warn "No logs yet"

# Step 11: Access information
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║   Next Steps                                               ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

log_info "To access ArgoCD UI:"
echo "  1. Port forward: kubectl port-forward svc/argocd-server -n argocd 8080:443"
echo "  2. Visit: https://localhost:8080"
echo "  3. Username: admin"
echo "  4. Password: $INITIAL_PASSWORD"
echo ""

log_info "To monitor Image Updater:"
echo "  kubectl logs -n argocd deployment/argocd-image-updater -f"
echo ""

log_info "To check application status:"
echo "  argocd app get letsgo-app"
echo ""

log_info "To manually sync:"
echo "  argocd app sync letsgo-app"
echo ""

log_success "Deployment complete!"
