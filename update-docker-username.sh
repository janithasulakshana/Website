#!/bin/bash

# Script to update Docker Hub username in ArgoCD deployment files
# Usage: ./update-docker-username.sh your-docker-username

if [ -z "$1" ]; then
    echo "Usage: ./update-docker-username.sh your-docker-username"
    echo "Example: ./update-docker-username.sh myusername"
    exit 1
fi

DOCKER_USERNAME=$1

echo "Updating Docker Hub username to: $DOCKER_USERNAME"

# Update deployment-backend.yaml
echo "Updating deployment-backend.yaml..."
sed -i "s|your-docker-username/website-backend|${DOCKER_USERNAME}/website-backend|g" deployment-backend.yaml

# Update deployment-frontend.yaml
echo "Updating deployment-frontend.yaml..."
sed -i "s|your-docker-username/website-frontend|${DOCKER_USERNAME}/website-frontend|g" deployment-frontend.yaml

# Update argocd-local-app.yaml
echo "Updating argocd-local-app.yaml..."
sed -i "s|your-docker-username/website-backend|${DOCKER_USERNAME}/website-backend|g" argocd-local-app.yaml
sed -i "s|your-docker-username/website-frontend|${DOCKER_USERNAME}/website-frontend|g" argocd-local-app.yaml

echo ""
echo "✅ Updated files:"
echo "   - deployment-backend.yaml"
echo "   - deployment-frontend.yaml"
echo "   - argocd-local-app.yaml"

echo ""
echo "Now apply the changes:"
echo "  kubectl apply -f deployment-backend.yaml -f deployment-frontend.yaml"
echo "  kubectl apply -f argocd-local-app.yaml"

echo ""
echo "Verify pods are running:"
echo "  kubectl get pods -n default -w"
