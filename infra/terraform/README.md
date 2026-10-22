cd envs/dev
cp terraform.tfvars.example terraform.tfvars
terraform init
terraform validate
terraform plan
terraform apply

aws eks update-kubeconfig --region ap-south-1 --name rightsave-dev
kubectl get nodes

skaffold dev --default-repo=<account>.dkr.ecr.ap-south-1.amazonaws.com/rightsave

terraform destroy