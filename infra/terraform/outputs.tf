output "resource_group_name" {
  description = "Created resource group name"
  value       = azurerm_resource_group.this.name
}

output "static_web_app_name" {
  description = "Created static web app name"
  value       = azurerm_static_web_app.this.name
}

output "default_host_name" {
  description = "Default hostname for the static web app"
  value       = azurerm_static_web_app.this.default_host_name
}
