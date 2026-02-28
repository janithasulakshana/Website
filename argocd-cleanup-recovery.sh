#!/bin/bash
# Cleanup and recovery scripts

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║   ArgoCD Cleanup & Recovery Tool                          ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo "Select an option:"
echo "1. Soft reset (keep ArgoCD, reset Image Updater)"
echo "2. Full cleanup (remove ArgoCD)"
echo "3. Emergency restore (recover from backup)"
echo "4. Backup current state"
echo "5. View current state"
echo ""

read -p "Choose option (1-5): " choice

case $choice in
    1)
        echo -e "${YELLOW}Soft Reset: Removing Image Updater...${NC}"
        
        echo "Deleting Image Updater deployment..."
        kubectl delete deployment -n argocd argocd-image-updater 2>/dev/null || true
        
        echo "Deleting Image Updater config..."
        kubectl delete configmap -n argocd argocd-image-updater-config 2>/dev/null || true
        
        echo "Deleting Git credentials..."
        kubectl delete secret -n argocd git-credentials 2>/dev/null || true
        
        echo -e "${GREEN}Soft reset complete!${NC}"
        echo ""
        echo "To reinstall: kubectl apply -f argocd-image-updater.yaml"
        ;;
        
    2)
        echo -e "${RED}Full Cleanup: Removing ArgoCD and all components...${NC}"
        read -p "Are you sure? (yes/no): " confirm
        
        if [ "$confirm" == "yes" ]; then
            echo "Deleting Applications..."
            kubectl delete application -n argocd letsgo-app 2>/dev/null || true
            
            echo "Deleting Image Updater..."
            kubectl delete deployment -n argocd argocd-image-updater 2>/dev/null || true
            
            echo "Deleting ArgoCD..."
            kubectl delete -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml 2>/dev/null || true
            
            echo "Deleting argocd namespace..."
            kubectl delete namespace argocd 2>/dev/null || true
            
            echo -e "${GREEN}Cleanup complete!${NC}"
        else
            echo "Cancelled."
        fi
        ;;
        
    3)
        echo -e "${YELLOW}Emergency Restore...${NC}"
        
        echo "This will reset ArgoCD to a clean state."
        read -p "Backup file (if exists): " backup_file
        
        if [ -z "$backup_file" ]; then
            echo "No backup specified. Reinstalling ArgoCD from scratch..."
            
            # Full reinstall
            kubectl delete namespace argocd 2>/dev/null || true
            sleep 2
            
            kubectl create namespace argocd
            kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
            
            kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=argocd-server -n argocd --timeout=300s
            
            echo -e "${GREEN}ArgoCD reinstalled!${NC}"
        else
            echo "Restoring from backup..."
            kubectl apply -f "$backup_file"
            echo -e "${GREEN}Restore complete!${NC}"
        fi
        ;;
        
    4)
        echo -e "${YELLOW}Backing up current state...${NC}"
        
        BACKUP_FILE="argocd-backup-$(date +%Y%m%d-%H%M%S).yaml"
        
        echo "Exporting ArgoCD resources..."
        {
            echo "# ArgoCD Backup - $(date)"
            echo "# Resources exported from namespace: argocd"
            echo ""
            
            kubectl get application -n argocd -o yaml
            echo "---"
            kubectl get secret -n argocd -o yaml
            echo "---"
            kubectl get configmap -n argocd -o yaml
        } > "$BACKUP_FILE"
        
        echo -e "${GREEN}Backup saved to: $BACKUP_FILE${NC}"
        echo "Size: $(du -h $BACKUP_FILE | cut -f1)"
        ;;
        
    5)
        echo -e "${YELLOW}Current ArgoCD State:${NC}"
        echo ""
        
        echo "Namespaces:"
        kubectl get namespace | grep argocd || echo "  (not found)"
        echo ""
        
        echo "Deployments:"
        kubectl get deployment -n argocd 2>/dev/null || echo "  (namespace not found)"
        echo ""
        
        echo "Applications:"
        kubectl get application -n argocd 2>/dev/null || echo "  (no applications)"
        echo ""
        
        echo "Secrets:"
        kubectl get secret -n argocd 2>/dev/null || echo "  (no secrets)"
        echo ""
        
        echo "ConfigMaps:"
        kubectl get configmap -n argocd 2>/dev/null || echo "  (no configs)"
        echo ""
        
        echo "ArgoCD Server Service:"
        kubectl get svc -n argocd argocd-server 2>/dev/null || echo "  (not found)"
        echo ""
        
        echo "Pods:"
        kubectl get pods -n argocd 2>/dev/null || echo "  (no pods)"
        ;;
        
    *)
        echo "Invalid option"
        ;;
esac
