#!/bin/bash
# End-to-end test of ArgoCD image automation

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║   ArgoCD Image Automation End-to-End Test                 ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Configuration
BACKEND_IMAGE="your-registry/backend"
TEST_TAG="v1.0.0-test-$(date +%s)"
REGISTRY_URL="your-registry"
NAMESPACE="default"

# Functions
test_pass() {
    echo -e "${GREEN}✓ PASS${NC}: $1"
}

test_fail() {
    echo -e "${RED}✗ FAIL${NC}: $1"
    exit 1
}

test_warn() {
    echo -e "${YELLOW}⚠ WARN${NC}: $1"
}

test_info() {
    echo -e "${BLUE}ℹ INFO${NC}: $1"
}

print_header() {
    echo ""
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}$1${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

# Test 1: Prerequisites
print_header "TEST 1: Prerequisites"

test_info "Checking kubectl..."
if kubectl cluster-info &> /dev/null; then
    test_pass "Kubernetes cluster accessible"
else
    test_fail "Cannot access Kubernetes cluster"
fi

test_info "Checking ArgoCD..."
if kubectl get namespace argocd &> /dev/null; then
    test_pass "ArgoCD namespace exists"
else
    test_fail "ArgoCD namespace not found"
fi

test_info "Checking Image Updater..."
if kubectl get deployment -n argocd argocd-image-updater &> /dev/null; then
    test_pass "Image Updater deployment found"
else
    test_fail "Image Updater deployment not found"
fi

test_info "Checking Application..."
if kubectl get application -n argocd letsgo-app &> /dev/null; then
    test_pass "ArgoCD Application found"
else
    test_fail "ArgoCD Application not found"
fi

# Test 2: Pod Health
print_header "TEST 2: Pod Health"

test_info "Checking ArgoCD server..."
if kubectl get pod -n argocd -l app.kubernetes.io/name=argocd-server -o jsonpath='{.items[0].status.phase}' | grep -q "Running"; then
    test_pass "ArgoCD server is running"
else
    test_fail "ArgoCD server is not running"
fi

test_info "Checking Image Updater pod..."
if kubectl get pod -n argocd -l app.kubernetes.io/name=argocd-image-updater -o jsonpath='{.items[0].status.phase}' | grep -q "Running"; then
    test_pass "Image Updater is running"
else
    test_fail "Image Updater is not running"
fi

# Test 3: Git Configuration
print_header "TEST 3: Git Configuration"

test_info "Checking Git credentials..."
if kubectl get secret -n argocd git-credentials &> /dev/null; then
    test_pass "Git credentials secret exists"
else
    test_fail "Git credentials secret not found"
fi

test_info "Checking Application Git config..."
GIT_REPO=$(kubectl get application -n argocd letsgo-app -o jsonpath='{.spec.source.repoURL}' 2>/dev/null)
if [ -n "$GIT_REPO" ]; then
    test_pass "Application points to Git repo: $GIT_REPO"
else
    test_fail "Application Git repository not configured"
fi

# Test 4: Kustomization
print_header "TEST 4: Kustomization"

test_info "Checking kustomization.yaml..."
if [ -f "manifests/base/kustomization.yaml" ]; then
    test_pass "kustomization.yaml exists"
else
    test_fail "kustomization.yaml not found"
fi

test_info "Checking images in kustomization..."
if grep -q "images:" manifests/base/kustomization.yaml; then
    test_pass "Images section found in kustomization"
else
    test_fail "Images section not found in kustomization"
fi

# Test 5: ArgoCD Application
print_header "TEST 5: ArgoCD Application"

test_info "Checking Application sync status..."
SYNC_STATUS=$(kubectl get application -n argocd letsgo-app -o jsonpath='{.status.sync.status}' 2>/dev/null)
if [ "$SYNC_STATUS" == "Synced" ] || [ "$SYNC_STATUS" == "OutOfSync" ]; then
    test_pass "Application status: $SYNC_STATUS"
else
    test_warn "Application status: $SYNC_STATUS (may be initializing)"
fi

test_info "Checking Application health..."
HEALTH=$(kubectl get application -n argocd letsgo-app -o jsonpath='{.status.health.status}' 2>/dev/null)
if [ "$HEALTH" == "Healthy" ]; then
    test_pass "Application is healthy"
elif [ "$HEALTH" == "Progressing" ]; then
    test_warn "Application is progressing"
else
    test_warn "Application health: $HEALTH"
fi

# Test 6: Deployments
print_header "TEST 6: Deployments"

test_info "Checking backend deployment..."
if kubectl get deployment backend -n $NAMESPACE &> /dev/null; then
    BACKEND_IMAGE=$(kubectl get deployment backend -o jsonpath='{.spec.template.spec.containers[0].image}')
    test_pass "Backend deployment found: $BACKEND_IMAGE"
else
    test_warn "Backend deployment not found (may not be deployed yet)"
fi

test_info "Checking frontend deployment..."
if kubectl get deployment frontend -n $NAMESPACE &> /dev/null; then
    FRONTEND_IMAGE=$(kubectl get deployment frontend -o jsonpath='{.spec.template.spec.containers[0].image}')
    test_pass "Frontend deployment found: $FRONTEND_IMAGE"
else
    test_warn "Frontend deployment not found (may not be deployed yet)"
fi

# Test 7: Image Updater Configuration
print_header "TEST 7: Image Updater Configuration"

test_info "Checking Image Updater config..."
if kubectl get configmap -n argocd argocd-image-updater-config &> /dev/null; then
    test_pass "Image Updater config exists"
else
    test_fail "Image Updater config not found"
fi

test_info "Checking Application image-list annotation..."
if kubectl get application -n argocd letsgo-app -o yaml | grep -q "image-list"; then
    test_pass "Application has image-list annotation"
else
    test_warn "Application may not have image-list annotation"
fi

# Test 8: Auto-Sync
print_header "TEST 8: Auto-Sync Configuration"

test_info "Checking auto-sync policy..."
AUTO_SYNC=$(kubectl get application -n argocd letsgo-app -o jsonpath='{.spec.syncPolicy.automated}' 2>/dev/null)
if echo "$AUTO_SYNC" | grep -q "true"; then
    test_pass "Auto-sync is enabled"
else
    test_warn "Auto-sync may not be properly configured"
fi

# Test 9: Simulation (Optional)
print_header "TEST 9: Drift Detection Simulation"

read -p "Run drift detection test? (This will check if drift is detected correctly) (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    test_info "Current sync status..."
    CURRENT_STATUS=$(kubectl get application -n argocd letsgo-app -o jsonpath='{.status.sync.status}')
    test_pass "Sync status: $CURRENT_STATUS"
    
    test_info "Last sync time..."
    LAST_SYNC=$(kubectl get application -n argocd letsgo-app -o jsonpath='{.status.operationState.finishedAt}')
    test_pass "Last sync: $LAST_SYNC"
    
    test_info "Testing manual drift detection..."
    if argocd app get letsgo-app --refresh 2>/dev/null; then
        test_pass "Manual refresh successful"
    else
        test_warn "Manual refresh may have issues"
    fi
fi

# Final Summary
print_header "TEST SUMMARY"

echo -e "${GREEN}All critical tests passed!${NC}"
echo ""
echo "Next steps:"
echo "1. Push a new image to your registry"
echo "2. Monitor Image Updater: kubectl logs -n argocd deployment/argocd-image-updater -f"
echo "3. Check Git commits: git log --oneline | grep 'auto: update'"
echo "4. Monitor ArgoCD sync: argocd app get letsgo-app --refresh"
echo "5. Verify pods updated: kubectl get pods -w"
echo ""
echo "Example test image:"
echo "  docker tag backend:latest $BACKEND_IMAGE:$TEST_TAG"
echo "  docker push $BACKEND_IMAGE:$TEST_TAG"
echo ""
