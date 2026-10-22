variable "cluster_name" { type = string }
variable "cluster_version" {
  type    = string
  default = "1.31"
}
variable "vpc_id" { type = string }
variable "private_subnet_ids" { type = list(string) }
variable "node_instance_types" {
  type    = list(string)
  default = ["t3.small"]
}
variable "node_capacity_type" {
  type    = string
  default = "SPOT"
}
variable "node_min_size" {
  type    = number
  default = 1
}
variable "node_desired_size" {
  type    = number
  default = 2
}
variable "node_max_size" {
  type    = number
  default = 3
}
variable "public_access_cidrs" {
  type    = list(string)
  default = ["0.0.0.0/0"]
}
variable "tags" {
  type    = map(string)
  default = {}
}
