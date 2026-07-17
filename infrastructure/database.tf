# 1. Database Subnet Group
resource "aws_db_subnet_group" "db_subnet_group" {
  name       = "cloudstore-db-subnet-group-tf"
  # We place the database exclusively in our PRIVATE subnets
  subnet_ids = [aws_subnet.private_a.id, aws_subnet.private_b.id]

  tags = {
    Name = "cloudstore-db-subnet-group-tf"
  }
}

# 2. PostgreSQL RDS Instance
resource "aws_db_instance" "postgres" {
  identifier             = "cloudstore-db-tf"
  engine                 = "postgres"
  engine_version         = "15" # Or whichever 15.x version is currently default
  instance_class         = "db.t3.micro"
  allocated_storage      = 20
  
  # Credentials (In a strict enterprise setup, we use Terraform to pull this from Secrets Manager!)
  db_name                = "ecommerce_db"
  username               = "admin_shan"
  password               = "CloudStoreDB2026!" 
  
  # Network & Security
  db_subnet_group_name   = aws_db_subnet_group.db_subnet_group.name
  vpc_security_group_ids = [aws_security_group.db_sg.id]
  publicly_accessible    = false

  # Lab environment settings (Do NOT use these in real production)
  skip_final_snapshot    = true  # Allows us to delete the DB quickly without taking a backup
  apply_immediately      = true  # Applies changes right away instead of waiting for a maintenance window

  tags = {
    Name = "cloudstore-db-tf"
  }
}
