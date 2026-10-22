module "vpc" {
  source = "../../modules/vpc"

  name               = var.cluster_name
  cidr               = var.vpc_cidr
  az_count           = 2
  single_nat_gateway = true
}

module "eks" {
  source = "../../modules/eks"

  cluster_name        = var.cluster_name
  vpc_id              = module.vpc.vpc_id
  private_subnet_ids  = module.vpc.private_subnets
  public_access_cidrs = [var.my_ip_cidr]

  node_instance_types = ["t3.small", "t3.small"]
  node_capacity_type  = "SPOT"
  node_min_size       = 1
  node_desired_size   = 2
  node_max_size       = 3
}

module "ecr" {
  source = "../../modules/ecr"

  prefix       = "rightsave"
  force_delete = true
}
