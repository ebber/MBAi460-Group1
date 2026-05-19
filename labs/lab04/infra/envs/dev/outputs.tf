output "invoke_url" {
  description = "Value for lab04-client-config.ini [client] webservice (no trailing slash)"
  value       = module.api.invoke_url
}

output "analyze_role_name" {
  value = module.analyze.role_name
}

output "weather_role_name" {
  value = module.weather.role_name
}

output "analyze_function_arn" {
  value = module.analyze.function_arn
}

output "weather_function_arn" {
  value = module.weather.function_arn
}
