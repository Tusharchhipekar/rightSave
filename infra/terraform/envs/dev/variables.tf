variable "region" {
  type    = string
  default = "ap-south-1"
}
variable "cluster_name" {
  type    = string
  default = "rightsave-dev"
}
variable "vpc_cidr" {
  type    = string
  default = "10.20.0.0/16"
}
variable "my_ip_cidr" {
  description = "Your IP for API endpoint access, e.g. 1.2.3.4/32"
  type        = string
  default     = "0.0.0.0/0"
}
