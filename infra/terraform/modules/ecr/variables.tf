variable "prefix" {
  type    = string
  default = "rightsave"
}
variable "repos" {
  type    = list(string)
  default = ["api-backend", "auth-service", "notification-service", "ml-worker", "frontend", "db-migrator"]
}
variable "force_delete" {
  type    = bool
  default = true
}
