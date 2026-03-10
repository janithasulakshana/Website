variable "resource_group_name" {
  description = "Azure Resource Group name"
  type        = string
}

variable "location" {
  description = "Azure region for deployment"
  type        = string
  default     = "East US 2"
}

variable "static_web_app_name" {
  description = "Azure Static Web App name"
  type        = string
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

variable "tags" {
  description = "Resource tags"
  type        = map(string)
  default = {
    project = "website"
    managed = "terraform"
  }
}
