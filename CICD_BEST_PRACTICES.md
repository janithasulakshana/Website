# CI/CD Integration Best Practices

## GitHub Actions Integration

### Build & Push Workflow

```yaml
name: Build, Push & Auto-Deploy

on:
  push:
    branches:
      - main
    paths:
      - "backend/**"
      - "frontend/**"
      - "Dockerfile*"
      - ".github/workflows/ci-cd.yml"
  pull_request:
    branches:
      - main

env:
  REGISTRY: your-registry.azurecr.io
  BACKEND_IMAGE: your-registry.azurecr.io/backend
  FRONTEND_IMAGE: your-registry.azurecr.io/frontend

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    outputs:
      backend-tag: ${{ steps.meta-backend.outputs.tags }}
      frontend-tag: ${{ steps.meta-frontend.outputs.tags }}
    
    permissions:
      contents: read
      packages: write
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3
      
      - name: Log in to registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ secrets.REGISTRY_USERNAME }}
          password: ${{ secrets.REGISTRY_PASSWORD }}
      
      # Generate semantic version from git tags
      - name: Generate version
        id: version
        run: |
          if [[ $GITHUB_REF == refs/tags/* ]]; then
            TAG=${GITHUB_REF#refs/tags/}
          else
            TAG=v0.0.0-${{ github.run_number }}
          fi
          echo "tag=$TAG" >> $GITHUB_OUTPUT
          echo "Version: $TAG"
      
      # Build backend
      - name: Build and push backend
        uses: docker/build-push-action@v5
        with:
          context: .
          file: ./Dockerfile
          push: ${{ github.event_name != 'pull_request' }}
          tags: |
            ${{ env.BACKEND_IMAGE }}:latest
            ${{ env.BACKEND_IMAGE }}:${{ steps.version.outputs.tag }}
          cache-from: type=registry,ref=${{ env.BACKEND_IMAGE }}:buildcache
          cache-to: type=registry,ref=${{ env.BACKEND_IMAGE }}:buildcache,mode=max
      
      # Build frontend
      - name: Build and push frontend
        uses: docker/build-push-action@v5
        with:
          context: .
          file: ./Dockerfile.frontend
          push: ${{ github.event_name != 'pull_request' }}
          tags: |
            ${{ env.FRONTEND_IMAGE }}:latest
            ${{ env.FRONTEND_IMAGE }}:${{ steps.version.outputs.tag }}
          cache-from: type=registry,ref=${{ env.FRONTEND_IMAGE }}:buildcache
          cache-to: type=registry,ref=${{ env.FRONTEND_IMAGE }}:buildcache,mode=max
      
      # Security scanning (optional)
      - name: Scan backend image
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: ${{ env.BACKEND_IMAGE }}:${{ steps.version.outputs.tag }}
          format: 'sarif'
          output: 'trivy-backend.sarif'
          severity: 'HIGH,CRITICAL'
      
      - name: Upload Trivy results
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: 'trivy-backend.sarif'

  test-deployment:
    needs: build-and-push
    if: github.event_name == 'pull_request'
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Validate manifests
        run: |
          # Validate YAML syntax
          for file in manifests/base/*.yaml; do
            echo "Validating $file..."
            kubectl apply -f "$file" --dry-run=client --validate=true
          done
      
      - name: Lint Kustomization
        run: |
          # Verify kustomization.yaml
          kustomize build manifests/base/

  notify-image-updater:
    needs: build-and-push
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    
    steps:
      - name: Trigger ArgoCD Image Updater
        run: |
          echo "New images pushed to registry"
          echo "Backend: ${{ env.BACKEND_IMAGE }}:${{ needs.build-and-push.outputs.backend-tag }}"
          echo "Frontend: ${{ env.FRONTEND_IMAGE }}:${{ needs.build-and-push.outputs.frontend-tag }}"
          echo ""
          echo "ArgoCD Image Updater will detect and deploy automatically"
```

## Semantic Versioning Strategy

### Version Bumping Script

```bash
#!/bin/bash
# Bump semantic version and trigger release

set -e

echo "Current version: $(git describe --tags --abbrev=0 2>/dev/null || echo 'no tags')"
echo ""
echo "Select version bump:"
echo "1. Patch (1.0.0 → 1.0.1) - Bug fixes"
echo "2. Minor (1.0.0 → 1.1.0) - New features (backward compatible)"
echo "3. Major (1.0.0 → 2.0.0) - Breaking changes"
echo ""

read -p "Choose (1-3): " choice

case $choice in
    1)
        BUMP="patch"
        ;;
    2)
        BUMP="minor"
        ;;
    3)
        BUMP="major"
        ;;
    *)
        echo "Invalid choice"
        exit 1
        ;;
esac

# Get current version
CURRENT=$(git describe --tags --abbrev=0 2>/dev/null || echo "v0.0.0")
IFS='.' read -r MAJOR MINOR PATCH <<< "${CURRENT#v}"

# Bump version
case $BUMP in
    patch)
        PATCH=$((PATCH + 1))
        ;;
    minor)
        MINOR=$((MINOR + 1))
        PATCH=0
        ;;
    major)
        MAJOR=$((MAJOR + 1))
        MINOR=0
        PATCH=0
        ;;
esac

NEW_VERSION="v$MAJOR.$MINOR.$PATCH"

echo ""
echo "Bumping version: $CURRENT → $NEW_VERSION"
echo ""

# Create tag and push
git tag -a "$NEW_VERSION" -m "Release $NEW_VERSION"
git push origin "$NEW_VERSION"

echo "Tagged: $NEW_VERSION"
echo "GitHub Actions will now build and push images automatically"
```

## Testing Pipeline

### Integration Tests

```bash
#!/bin/bash
# Integration tests for deployment

set -e

echo "Running integration tests..."

# Test 1: Verify manifest syntax
echo "Test 1: Validating manifests..."
for f in manifests/base/*.yaml; do
  kubectl apply -f "$f" --dry-run=client -o yaml > /dev/null
done
echo "✓ All manifests valid"

# Test 2: Verify kustomize build
echo "Test 2: Testing Kustomize build..."
kustomize build manifests/base/ | kubectl apply --dry-run=client -f -
echo "✓ Kustomize build successful"

# Test 3: Verify images in kustomization
echo "Test 3: Checking image references..."
if grep -q "images:" manifests/base/kustomization.yaml; then
  echo "✓ Images section found"
else
  echo "✗ Images section missing"
  exit 1
fi

# Test 4: Validate image names
echo "Test 4: Validating image names..."
EXPECTED_BACKEND="your-registry/backend"
EXPECTED_FRONTEND="your-registry/frontend"

if grep -q "$EXPECTED_BACKEND" manifests/base/kustomization.yaml; then
  echo "✓ Backend image configured"
else
  echo "✗ Backend image not found"
  exit 1
fi

if grep -q "$EXPECTED_FRONTEND" manifests/base/kustomization.yaml; then
  echo "✓ Frontend image configured"
else
  echo "✗ Frontend image not found"
  exit 1
fi

# Test 5: Verify ArgoCD Application config
echo "Test 5: Validating ArgoCD Application..."
kubectl apply -f argocd-application.yaml --dry-run=client -o yaml > /dev/null
echo "✓ ArgoCD Application valid"

echo ""
echo "All integration tests passed!"
```

### Load Testing

```bash
#!/bin/bash
# Load test after deployment

set -e

FRONTEND_URL=${1:-"http://localhost:3000"}
DURATION=${2:-"60"}  # seconds
THREADS=${3:-"10"}

echo "Running load test..."
echo "URL: $FRONTEND_URL"
echo "Duration: ${DURATION}s"
echo "Threads: $THREADS"
echo ""

# Using Apache Bench
ab -n 10000 -c $THREADS -t $DURATION "$FRONTEND_URL/" || {
    echo "Falling back to curl..."
    for i in $(seq 1 100); do
        curl -s "$FRONTEND_URL/" > /dev/null
    done
}

echo "Load test complete"
```

## Rollback Strategy

### Automated Rollback on Failure

```yaml
name: Automated Rollback

on:
  workflow_run:
    workflows: ["Build, Push & Auto-Deploy"]
    types: [completed]

jobs:
  check-health:
    if: ${{ github.event.workflow_run.conclusion == 'success' }}
    runs-on: ubuntu-latest
    
    steps:
      - name: Wait for deployment
        run: sleep 30
      
      - name: Check pod health
        run: |
          kubectl get pods -l app=backend
          # Add health check logic
      
      - name: Rollback if failed
        if: failure()
        run: |
          echo "Health check failed, initiating rollback..."
          # Revert to previous tag
          git log --oneline | head -2
```

## Security Best Practices

### Image Signing

```yaml
# github-actions/sign-images.yml
- name: Install Cosign
  uses: sigstore/cosign-installer@v3

- name: Sign backend image
  env:
    COSIGN_PRIVATE_KEY: ${{ secrets.COSIGN_PRIVATE_KEY }}
    COSIGN_PASSWORD: ${{ secrets.COSIGN_PASSWORD }}
  run: |
    cosign sign --key env://COSIGN_PRIVATE_KEY \
      ${{ env.BACKEND_IMAGE }}:${{ steps.version.outputs.tag }}

- name: Verify image signature
  run: |
    cosign verify --key cosign.pub \
      ${{ env.BACKEND_IMAGE }}:${{ steps.version.outputs.tag }}
```

### SBOM Generation

```yaml
# Generate Software Bill of Materials
- name: Generate SBOM
  uses: anchore/sbom-action@v0
  with:
    image: ${{ env.BACKEND_IMAGE }}:${{ steps.version.outputs.tag }}
    format: json
    output-file: sbom.json
```

## Pre-Deployment Checks

```bash
#!/bin/bash
# Pre-deployment validation

set -e

echo "Pre-deployment checks..."
echo ""

# Check 1: Git is clean
if [ -z "$(git status --porcelain)" ]; then
  echo "✓ Git working directory clean"
else
  echo "✗ Git working directory dirty"
  git status
  exit 1
fi

# Check 2: Tests pass
echo "✓ Running tests..."
npm test || exit 1

# Check 3: Security scan
echo "✓ Running security scan..."
docker run --rm -v "$(pwd):/src" aquasec/trivy fs /src || exit 1

# Check 4: Linting
echo "✓ Running linters..."
npm run lint || exit 1

# Check 5: Build succeeds
echo "✓ Building Docker images..."
docker build -f Dockerfile -t test-backend . || exit 1
docker build -f Dockerfile.frontend -t test-frontend . || exit 1

# Check 6: Verify manifests
echo "✓ Validating Kubernetes manifests..."
kubectl apply -f manifests/base/ --dry-run=client || exit 1

echo ""
echo "All pre-deployment checks passed!"
echo "Ready to deploy"
```

## Deployment Checklist

- [ ] All tests passing
- [ ] Code review approved
- [ ] Security scan completed
- [ ] Image built and pushed
- [ ] Git tag created
- [ ] Deployment manifests updated in Git
- [ ] ArgoCD Image Updater configured
- [ ] Monitoring and alerts set up
- [ ] Rollback procedure documented
- [ ] Team notified of deployment
- [ ] Post-deployment checks passed
