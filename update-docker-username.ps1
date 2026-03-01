# Script to update Docker Hub username in ArgoCD deployment files
# Usage: .\update-docker-username.ps1 -DockerUsername "your-docker-username"

param(
    [Parameter(Mandatory=$true)]
    [string]$DockerUsername
)

Write-Host "Updating Docker Hub username to: $DockerUsername" -ForegroundColor Cyan

$files = @(
    "deployment-backend.yaml",
    "deployment-frontend.yaml",
    "argocd-local-app.yaml"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "Updating $file..." -ForegroundColor Green
        
        $content = Get-Content $file -Raw
        $content = $content -replace "your-docker-username", $DockerUsername
        Set-Content $file $content
    } else {
        Write-Host "Warning: $file not found" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "✅ Updated files:" -ForegroundColor Green
Write-Host "   - deployment-backend.yaml"
Write-Host "   - deployment-frontend.yaml"
Write-Host "   - argocd-local-app.yaml"

Write-Host ""
Write-Host "Now apply the changes:" -ForegroundColor Yellow
Write-Host '  kubectl apply -f deployment-backend.yaml -f deployment-frontend.yaml'
Write-Host '  kubectl apply -f argocd-local-app.yaml'

Write-Host ""
Write-Host "Verify pods are running:" -ForegroundColor Yellow
Write-Host '  kubectl get pods -n default -w'
