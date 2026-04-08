output "resource_group_name" {
  description = "Resource group name"
  value       = azurerm_resource_group.this.name
}

# ─── Static Web App ────────────────────────────────────────────────────────────
output "static_web_app_name" {
  description = "Static Web App name"
  value       = azurerm_static_web_app.this.name
}

output "static_web_app_hostname" {
  description = "Static Web App default hostname"
  value       = azurerm_static_web_app.this.default_host_name
}

# ─── ACR ───────────────────────────────────────────────────────────────────────
output "acr_login_server" {
  description = "ACR login server URL (use in pipeline as IMAGE prefix)"
  value       = azurerm_container_registry.acr.login_server
}

# ─── AKS ───────────────────────────────────────────────────────────────────────
output "aks_cluster_name" {
  description = "AKS cluster name"
  value       = azurerm_kubernetes_cluster.aks.name
}

output "aks_get_credentials_cmd" {
  description = "Run this command to configure kubectl"
  value       = "az aks get-credentials -n ${azurerm_kubernetes_cluster.aks.name} -g ${azurerm_resource_group.this.name} --overwrite-existing"
}

# ─── Monitoring ────────────────────────────────────────────────────────────────
output "log_analytics_workspace_id" {
  description = "Log Analytics Workspace ID"
  value       = azurerm_log_analytics_workspace.this.workspace_id
}

output "app_insights_connection_string" {
  description = "Application Insights connection string"
  value       = azurerm_application_insights.this.connection_string
  sensitive   = true
}

output "app_insights_instrumentation_key" {
  description = "Application Insights instrumentation key"
  value       = azurerm_application_insights.this.instrumentation_key
  sensitive   = true
}

# ─── Key Vault ─────────────────────────────────────────────────────────────────
output "key_vault_uri" {
  description = "Key Vault URI for secret references"
  value       = azurerm_key_vault.this.vault_uri
}
