# 1. Application Load Balancer Security Group (Public)
resource "aws_security_group" "alb_sg" {
  name        = "cloudstore-alb-sg-tf"
  description = "Allow HTTP traffic from the internet"
  vpc_id      = aws_vpc.main.id

  ingress {
    description = "HTTP from Internet"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    description = "Allow all outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1" # -1 means all protocols
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  tags = { Name = "cloudstore-alb-sg-tf" }
}

# 2. Application (ECS) Security Group (Private)
resource "aws_security_group" "app_sg" {
  name        = "cloudstore-app-sg-tf"
  description = "Allow traffic only from ALB"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "HTTP from ALB to Frontend"
    from_port       = 80
    to_port         = 80
    protocol        = "tcp"
    security_groups = [aws_security_group.alb_sg.id] # Only accept from ALB!
  }

  ingress {
    description     = "Traffic from ALB to Backend"
    from_port       = 5000
    to_port         = 5000
    protocol        = "tcp"
    security_groups = [aws_security_group.alb_sg.id] 
  }

  egress {
    description = "Allow all outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "cloudstore-app-sg-tf" }
}

# 3. Database Security Group (Private)
resource "aws_security_group" "db_sg" {
  name        = "cloudstore-db-sg-tf"
  description = "Allow traffic only from ECS App"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "PostgreSQL traffic from App"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.app_sg.id] # Only accept from ECS!
  }

  egress {
    description = "Allow all outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "cloudstore-db-sg-tf" }
}
