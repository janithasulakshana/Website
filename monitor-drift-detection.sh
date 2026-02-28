#!/bin/bash
# Monitor ArgoCD drift detection in real-time

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

clear

echo -e "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║   ArgoCD Drift Detection Monitor                          ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Configuration
REFRESH_INTERVAL=5
NAMESPACE="argocd"
APP_NAME="letsgo-app"

# Functions
print_section() {
    echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${MAGENTA}$1${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
}

print_status() {
    local status=$1
    local message=$2
    
    case $status in
        "synced")
            echo -e "${GREEN}✓ $message${NC}"
            ;;
        "error"|"unknown")
            echo -e "${RED}✗ $message${NC}"
            ;;
        "outofsync")
            echo -e "${YELLOW}⚠ $message${NC}"
            ;;
        "syncing")
            echo -e "${BLUE}↻ $message${NC}"
            ;;
        *)
            echo -e "${YELLOW}• $message${NC}"
            ;;
    esac
}

get_app_status() {
    kubectl get application -n $NAMESPACE $APP_NAME -o jsonpath='{.status.operationState.phase}' 2>/dev/null || echo "Unknown"
}

get_sync_status() {
    kubectl get application -n $NAMESPACE $APP_NAME -o jsonpath='{.status.sync.status}' 2>/dev/null || echo "Unknown"
}

get_health() {
    kubectl get application -n $NAMESPACE $APP_NAME -o jsonpath='{.status.health.status}' 2>/dev/null || echo "Unknown"
}

get_last_sync() {
    kubectl get application -n $NAMESPACE $APP_NAME -o jsonpath='{.status.operationState.finishedAt}' 2>/dev/null || echo "Never"
}

get_image_updater_logs() {
    kubectl logs -n $NAMESPACE deployment/argocd-image-updater --tail=5 2>/dev/null | tail -5
}

get_backend_image() {
    kubectl get deployment backend -o jsonpath='{.spec.template.spec.containers[0].image}' 2>/dev/null || echo "Not found"
}

get_frontend_image() {
    kubectl get deployment frontend -o jsonpath='{.spec.template.spec.containers[0].image}' 2>/dev/null || echo "Not found"
}

get_pod_count() {
    local label=$1
    kubectl get pods -l "app=$label" --no-headers 2>/dev/null | wc -l
}

get_git_commits() {
    git log --oneline | grep "auto: update" | head -5 2>/dev/null || echo "No commits"
}

# Main monitoring loop
while true; do
    clear
    
    echo -e "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║   ArgoCD Drift Detection Monitor                          ║${NC}"
    echo -e "${CYAN}║   $(date '+%Y-%m-%d %H:%M:%S')                                           ║${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    # Application Status
    print_section "APPLICATION STATUS"
    SYNC_STATUS=$(get_sync_status)
    HEALTH=$(get_health)
    LAST_SYNC=$(get_last_sync)
    
    print_status "$SYNC_STATUS" "Sync Status: $SYNC_STATUS"
    print_status "$HEALTH" "Health: $HEALTH"
    echo "Last Sync: $LAST_SYNC"
    echo ""
    
    # Image Information
    print_section "RUNNING IMAGES"
    echo "Backend: $(get_backend_image)"
    echo "Frontend: $(get_frontend_image)"
    echo ""
    
    # Pod Status
    print_section "POD STATUS"
    BACKEND_PODS=$(get_pod_count "backend")
    FRONTEND_PODS=$(get_pod_count "frontend")
    
    echo "Backend Pods: $BACKEND_PODS"
    kubectl get pods -l app=backend --no-headers 2>/dev/null | awk '{print "  - " $1 ": " $3}' || echo "  (none)"
    echo ""
    
    echo "Frontend Pods: $FRONTEND_PODS"
    kubectl get pods -l app=frontend --no-headers 2>/dev/null | awk '{print "  - " $1 ": " $3}' || echo "  (none)"
    echo ""
    
    # Image Updater Activity
    print_section "IMAGE UPDATER ACTIVITY"
    echo "Recent logs (last 5 lines):"
    get_image_updater_logs | sed 's/^/  /'
    echo ""
    
    # Git Activity
    print_section "GIT COMMITS (auto-updates)"
    echo "Recent image update commits:"
    get_git_commits | sed 's/^/  /'
    echo ""
    
    # Drift Detection Status
    print_section "DRIFT DETECTION"
    
    if [ "$SYNC_STATUS" == "Synced" ]; then
        print_status "synced" "No drift detected - cluster matches Git"
    elif [ "$SYNC_STATUS" == "OutOfSync" ]; then
        print_status "outofsync" "DRIFT DETECTED - cluster differs from Git"
        echo "ArgoCD will auto-sync if auto-sync is enabled"
    else
        print_status "unknown" "Unknown drift status: $SYNC_STATUS"
    fi
    echo ""
    
    # Tips
    print_section "USEFUL COMMANDS"
    echo "Monitor status:      kubectl get application -n argocd letsgo-app"
    echo "Full details:        argocd app get letsgo-app"
    echo "Force sync:          argocd app sync letsgo-app"
    echo "View app logs:       kubectl logs -n argocd deployment/argocd-image-updater -f"
    echo "View git commits:    git log --oneline | grep 'auto: update'"
    echo ""
    echo -e "${YELLOW}Refreshing in ${REFRESH_INTERVAL} seconds... (Ctrl+C to exit)${NC}"
    echo ""
    
    sleep $REFRESH_INTERVAL
done
