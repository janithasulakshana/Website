# Terraform for Azure Static Web App

This folder provisions Azure infrastructure for Static Web App hosting.

## What It Creates

- One Resource Group
- One Azure Static Web App

## Prerequisites

- Terraform >= 1.6.0
- Azure subscription access
- GitHub OIDC or service principal credentials for CI

## Local Usage

1. Copy `terraform.tfvars.example` to `terraform.tfvars` and update values.
2. Run:

```bash
terraform init
terraform fmt -check
terraform validate
terraform plan -out tfplan
```

3. Apply manually when ready:

```bash
terraform apply tfplan
```

## CI Workflow

Use `.github/workflows/terraform-plan.yml` to run fmt/validate/plan automatically.

Required GitHub secrets/variables for OIDC auth:

- `AZURE_CLIENT_ID`
- `AZURE_TENANT_ID`
- `AZURE_SUBSCRIPTION_ID`
- `TF_VAR_resource_group_name`
- `TF_VAR_static_web_app_name`

Optional variable:

- `TF_VAR_location`

## Important

Terraform provisions the Static Web App resource. Frontend build/upload should continue through your existing Azure Static Web Apps workflow.
