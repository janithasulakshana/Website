# DevOps Commands Reference

This document is a printable quick reference for daily DevOps operations.

## Usage Notes
- Replace placeholders like `<resource-group>`, `<app-name>`, `<namespace>`, `<repo-url>` before running commands.
- Verify current environment before destructive commands (`destroy`, `delete`, `prune`).
- Prefer non-production environments for testing first.

## 1. Git and GitHub

### Git Basics
```bash
git clone <repo-url>
git checkout -b feat/<name>
git status
git log --oneline --graph --decorate -20
git diff
git add .
git commit -m "feat: <message>"
git push -u origin feat/<name>
```

### Sync and Recovery
```bash
git fetch origin
git rebase origin/main
git pull --rebase
git revert <commit-sha>
git reset --soft HEAD~1
```

### GitHub CLI
```bash
gh auth login
gh repo view
gh pr create --title "feat: <title>" --body "details"
gh workflow list
gh workflow run "<workflow-name>"
gh run list
gh run view <run-id> --log
```

## 2. Terraform

### Init, Format, Validate
```bash
cd infra/terraform
terraform init
terraform fmt -recursive
terraform validate
```

### Plan and Apply
```bash
terraform plan -no-color
terraform plan -out tfplan
terraform apply tfplan
```

### Destroy and State
```bash
terraform destroy
terraform output
terraform state list
terraform state show <resource-address>
terraform import <resource-address> <cloud-id>
```

### Workspaces
```bash
terraform workspace list
terraform workspace new dev
terraform workspace select prod
```

## 3. Azure CLI

### Login and Subscription
```bash
az login
az account list -o table
az account set --subscription "<subscription-id>"
az account show
```

### Resource Groups
```bash
az group create --name <resource-group> --location "East US 2"
az group list -o table
az group delete --name <resource-group> --yes --no-wait
```

### AKS
```bash
az aks list -o table
az aks get-credentials --resource-group <resource-group> --name <aks-name> --overwrite-existing
az aks nodepool list --resource-group <resource-group> --cluster-name <aks-name> -o table
```

### ACR
```bash
az acr create --resource-group <resource-group> --name <acr-name> --sku Basic
az acr login --name <acr-name>
az acr repository list --name <acr-name> -o table
az acr repository show-tags --name <acr-name> --repository <image> -o table
```

### Static Web App
```bash
az staticwebapp list -o table
az staticwebapp show --name <swa-name> --resource-group <resource-group>
```

## 4. Kubernetes (`kubectl`)

### Context and Namespace
```bash
kubectl config get-contexts
kubectl config current-context
kubectl get ns
kubectl create ns <namespace>
kubectl config set-context --current --namespace=<namespace>
```

### Deployments and Rollouts
```bash
kubectl apply -f <file-or-dir>
kubectl apply -k <kustomize-dir>
kubectl rollout status deploy/<name>
kubectl rollout history deploy/<name>
kubectl rollout undo deploy/<name>
kubectl scale deploy/<name> --replicas=3
```

### Troubleshooting
```bash
kubectl get all -n <namespace>
kubectl describe pod <pod>
kubectl logs <pod>
kubectl logs -f deploy/<name>
kubectl exec -it <pod> -- sh
kubectl get events --sort-by=.lastTimestamp
```

### Networking and Secrets
```bash
kubectl get svc,ingress
kubectl port-forward svc/<service> 8080:80
kubectl create secret generic <name> --from-literal=key=value
kubectl get secret <name> -o yaml
```

## 5. OpenShift (`oc`)

### Login and Projects
```bash
oc login https://api.<cluster>:6443
oc whoami
oc projects
oc new-project <project>
oc project <project>
```

### Deploy and Expose
```bash
oc apply -f <manifest>
oc get all
oc expose svc/<service-name>
oc get route
oc get route <route-name> -o yaml
```

### Build and Image Flows
```bash
oc new-build --name <app> --binary --strategy docker
oc start-build <app> --from-dir=. --follow
oc new-app <image-or-template>
oc get is
```

### Security and Diagnostics
```bash
oc logs deploy/<name>
oc describe pod <pod>
oc get scc
oc adm policy add-scc-to-user anyuid -z <serviceaccount> -n <project>
```

## 6. Argo CD

### Login and App Operations
```bash
argocd login <argocd-server> --username admin --password <password> --insecure
argocd app list
argocd app get <app>
argocd app sync <app>
argocd app wait <app> --health --sync
argocd app history <app>
argocd app rollback <app> <history-id>
```

### App Creation
```bash
argocd app create <app> \
  --repo <repo-url> \
  --path <path> \
  --dest-server https://kubernetes.default.svc \
  --dest-namespace <namespace>
```

### Diff and Debug
```bash
argocd app diff <app>
argocd app logs <app>
argocd proj list
argocd cluster list
```

## 7. Docker

### Build, Run, Push
```bash
docker build -t <image>:<tag> .
docker run -p 8080:80 <image>:<tag>
docker login
docker tag <image>:<tag> <registry>/<image>:<tag>
docker push <registry>/<image>:<tag>
```

### Inspect and Cleanup
```bash
docker images
docker ps -a
docker logs <container>
docker exec -it <container> sh
docker system df
docker system prune -f
```

## 8. Helm

### Repo and Search
```bash
helm repo add <name> <url>
helm repo update
helm search repo <keyword>
```

### Install and Upgrade
```bash
helm install <release> <chart> -n <namespace> --create-namespace
helm upgrade --install <release> <chart> -n <namespace>
```

### Rollback and Remove
```bash
helm list -A
helm history <release> -n <namespace>
helm rollback <release> <revision> -n <namespace>
helm uninstall <release> -n <namespace>
```

## 9. CI/CD and GitHub Actions

### Run and Inspect Workflows
```bash
gh workflow list
gh workflow run "<workflow-name>"
gh run list
gh run view <run-id> --log
```

### Manage Secrets and Variables
```bash
gh secret set AZURE_CLIENT_ID
gh secret set AZURE_TENANT_ID
gh secret set AZURE_SUBSCRIPTION_ID
gh variable set TF_VAR_resource_group_name --body "<resource-group>"
gh variable set TF_VAR_static_web_app_name --body "<swa-name>"
```

## 10. Incident and Debug Quick Commands

### Linux
```bash
df -h
free -m
top
ss -tulpen
curl -I <url>
nslookup <host>
```

### PowerShell (Windows)
```powershell
Get-Process | Sort-Object CPU -Descending | Select-Object -First 10
Get-Service
Test-NetConnection <host> -Port 443
Resolve-DnsName <host>
```

## Project-Specific Quick Start

### Terraform in This Repo
```bash
cd infra/terraform
terraform init
terraform fmt -check -recursive
terraform validate
terraform plan -no-color
```

### Kubernetes/OpenShift in This Repo
```bash
kubectl apply -f configmap.yaml
kubectl apply -f secret-app.yaml
kubectl apply -f deployment-backend.yaml
kubectl apply -f deployment-frontend.yaml

oc expose service website-frontend --name website-frontend-route
oc get route website-frontend-route
```
