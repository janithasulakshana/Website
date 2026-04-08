terraform {
  required_version = ">= 1.6.0"

  # Remote state in Azure Storage Account
  # Create once manually before terraform init:
  #   az storage account create -n tfstatewebsite -g my-rg --sku Standard_LRS
  #   az storage container create -n tfstate --account-name tfstatewebsite
  # backend "azurerm" {
  #   resource_group_name  = "my-rg"
  #   storage_account_name = "tfstatewebsite"
  #   container_name       = "tfstate"
  #   key                  = "website.terraform.tfstate"
  # }

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.0"
    }
  }
}

provider "azurerm" {
  features {}
  # CI identity may not have permissions to register providers.
  # Keep registration explicit/out-of-band to avoid transient 409 conflicts.
  resource_provider_registrations = "none"
}

# ─── Resource Group ────────────────────────────────────────────────────────────
resource "azurerm_resource_group" "this" {
  name     = var.resource_group_name
  location = var.location
  tags     = var.tags
}

# ─── Static Web App (frontend) ─────────────────────────────────────────────────
resource "azurerm_static_web_app" "this" {
  name                = var.static_web_app_name
  resource_group_name = azurerm_resource_group.this.name
  location            = azurerm_resource_group.this.location
  sku_tier            = var.sku_tier
  sku_size            = var.sku_size
  tags                = var.tags
}

# ─── Azure Container Registry ──────────────────────────────────────────────────
resource "azurerm_container_registry" "acr" {
  name                = var.acr_name
  resource_group_name = azurerm_resource_group.this.name
  location            = azurerm_resource_group.this.location
  sku                 = var.acr_sku
  admin_enabled       = false  # Use managed identity, not admin credentials
  tags                = var.tags
}

# ─── Log Analytics Workspace ───────────────────────────────────────────────────
resource "azurerm_log_analytics_workspace" "this" {
  name                = var.log_analytics_workspace_name
  resource_group_name = azurerm_resource_group.this.name
  location            = azurerm_resource_group.this.location
  sku                 = "PerGB2018"
  retention_in_days   = 30
  tags                = var.tags
}

# ─── Application Insights ──────────────────────────────────────────────────────
resource "azurerm_application_insights" "this" {
  name                = var.app_insights_name
  resource_group_name = azurerm_resource_group.this.name
  location            = azurerm_resource_group.this.location
  workspace_id        = azurerm_log_analytics_workspace.this.id
  application_type    = "web"
  tags                = var.tags
}

# ─── AKS Cluster ───────────────────────────────────────────────────────────────
resource "azurerm_kubernetes_cluster" "aks" {
  name                = var.aks_cluster_name
  resource_group_name = azurerm_resource_group.this.name
  location            = azurerm_resource_group.this.location
  dns_prefix          = var.aks_dns_prefix
  kubernetes_version  = var.kubernetes_version
  tags                = var.tags

  default_node_pool {
    name       = "nodepool1"
    node_count = var.aks_node_count
    vm_size    = var.aks_vm_size
    os_disk_size_gb = 30
  }

  identity {
    type = "SystemAssigned"  # Managed identity — no service principal needed
  }

  oms_agent {
    log_analytics_workspace_id = azurerm_log_analytics_workspace.this.id
  }

  network_profile {
    network_plugin = "kubenet"
    load_balancer_sku = "standard"
  }
}

# ─── Attach ACR to AKS (grant AKS pull access to ACR) ─────────────────────────
resource "azurerm_role_assignment" "aks_acr_pull" {
  scope                = azurerm_container_registry.acr.id
  role_definition_name = "AcrPull"
  principal_id         = azurerm_kubernetes_cluster.aks.kubelet_identity[0].object_id
}

# ─── Key Vault (store secrets securely) ────────────────────────────────────────
data "azurerm_client_config" "current" {}

resource "azurerm_key_vault" "this" {
  name                = var.key_vault_name
  resource_group_name = azurerm_resource_group.this.name
  location            = azurerm_resource_group.this.location
  tenant_id           = data.azurerm_client_config.current.tenant_id
  sku_name            = "standard"
  tags                = var.tags

  access_policy {
    tenant_id = data.azurerm_client_config.current.tenant_id
    object_id = data.azurerm_client_config.current.object_id

    secret_permissions = ["Get", "List", "Set", "Delete"]
  }
}

# Store App Insights connection string in Key Vault
resource "azurerm_key_vault_secret" "app_insights_connection_string" {
  name         = "appinsights-connection-string"
  value        = azurerm_application_insights.this.connection_string
  key_vault_id = azurerm_key_vault.this.id
}
