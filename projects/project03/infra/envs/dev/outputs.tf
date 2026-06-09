output "invoke_url" {
  value = module.api.invoke_url
}

output "auth_endpoint" {
  value = "${module.api.invoke_url}/auth"
}

output "function_name" {
  value = module.authenticate.function_name
}

output "role_name" {
  value = module.authenticate.role_name
}
