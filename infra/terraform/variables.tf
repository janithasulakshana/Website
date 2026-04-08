variable "resource_group_name" {
  description = "Azure Resource Group name"
  type        = string
  default     = "my-rg"
}

variable "location" {
  description = "Azure region for deployment"
  type        = string
  default     = "East US 2"
}

variable "tags" {
  description = "Resource tags"
  type        = map(string)
  default = {
    project     = "website"
    managed_by  = "terraform"
    environment = "production"
  }
}

# ─── Static Web App ────────────────────────────────────────────────────────────
variable "static_web_app_name" {
  description = "Azure Static Web App name"
  type        = string
  default     = "website-frontend"
}

variable "sku_tier" {
  description = "Static Web App SKU tier"
  type        = string
  default     = "Free"
}

variable "sku_size" {
  description = "Static Web App SKU size"
  type        = string
  default     = "Free"
}

# ─── ACR ───────────────────────────────────────────────────────────────────────
variable "acr_name" {
  description = "Azure Container Registry name (must be globally unique, alphanumeric only)"
  type        = string
  default     = "websiteacr"
}

variable "acr_sku" {
  description = "ACR SKU: Basic, Standard, Premium"
  type        = string
  default     = "Standard"
}

# ─── Log Analytics ─────────────────────────────────────────────────────────────
variable "log_analytics_workspace_name" {
  description = "Log Analytics Workspace name"
  type        = string
  default     = "website-logs"
}

# ─── Application Insights ──────────────────────────────────────────────────────
variable "app_insights_name" {
  description = "Application Insights name"
  type        = string
  default     = "website-appinsights"
}

# ─── AKS ───────────────────────────────────────────────────────────────────────
variable "aks_cluster_name" {
  description = "AKS cluster name"
  type        = string
  default     = "my-aks"
}

variable "aks_dns_prefix" {
  description = "DNS prefix for AKS"
  type        = string
  default     = "websiteaks"
}

variable "kubernetes_version" {
  description = "Kubernetes version"
  type        = string
  default     = "1.31"
}

variable "aks_node_count" {
  description = "Number of AKS nodes"
  type        = number
  default     = 1
}

variable "aks_vm_size" {
  description = "AKS node VM size (Standard_B2s = 2 vCPU, 4GB RAM — fits in free quota)"
  type        = string
  default     = "Standard_B2s"
}

# ─── Key Vault ─────────────────────────────────────────────────────────────────
variable "key_vault_name" {
  description = "Key Vault name (must be globally unique)"
  type        = string
  default     = "website-kv"
}
