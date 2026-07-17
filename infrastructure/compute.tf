# 1. The ECS Cluster
resource "aws_ecs_cluster" "main" {
  name = "cloudstore-cluster-tf"
}

# 2. IAM Role for ECS Task Execution (Allows ECS to pull images and write logs)
resource "aws_iam_role" "ecs_execution_role" {
  name = "cloudstore-ecs-execution-role-tf"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = { Service = "ecs-tasks.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_execution_role_policy" {
  role       = aws_iam_role.ecs_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# 3. Backend Task Definition
resource "aws_ecs_task_definition" "backend" {
  family                   = "ecommerce-backend-task-tf"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.ecs_execution_role.arn

  container_definitions = jsonencode([{
    name      = "backend"
    image     = "821279529265.dkr.ecr.us-east-1.amazonaws.com/ecommerce-backend:latest"
    essential = true
    portMappings = [{
      containerPort = 5000
      protocol      = "tcp"
    }]
    environment = [
      # Dynamically injecting the Database URL from the RDS resource!
      { name = "DATABASE_URL", value = "postgresql://admin_shan:CloudStoreDB2026!@${aws_db_instance.postgres.endpoint}/ecommerce_db?schema=public" },
      { name = "JWT_SECRET", value = "production_super_secret_key_123" }
    ]
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = aws_cloudwatch_log_group.backend_logs.name
        "awslogs-region"        = "us-east-1"
        "awslogs-stream-prefix" = "ecs"
      }
    }
  }])
}

# 4. Backend ECS Service
resource "aws_ecs_service" "backend" {
  name            = "backend-service-tf"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.backend.arn
  desired_count   = 1
  launch_type     = "FARGATE"
  
  # Wait for the ALB to be ready before starting containers
  depends_on      = [aws_lb_listener_rule.api_routing]

  network_configuration {
    subnets          = [aws_subnet.private_a.id, aws_subnet.private_b.id]
    security_groups  = [aws_security_group.app_sg.id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.backend_tg.arn
    container_name   = "backend"
    container_port   = 5000
  }
}

# 5. Frontend Task Definition
resource "aws_ecs_task_definition" "frontend" {
  family                   = "ecommerce-frontend-task-tf"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.ecs_execution_role.arn

  container_definitions = jsonencode([{
    name      = "frontend"
    image     = "821279529265.dkr.ecr.us-east-1.amazonaws.com/ecommerce-frontend:latest"
    essential = true
    portMappings = [{
      containerPort = 80
      protocol      = "tcp"
    }]
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = aws_cloudwatch_log_group.frontend_logs.name
        "awslogs-region"        = "us-east-1"
        "awslogs-stream-prefix" = "ecs"
      }
    }
  }])
}

# 6. Frontend ECS Service
resource "aws_ecs_service" "frontend" {
  name            = "frontend-service-tf"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.frontend.arn
  desired_count   = 1
  launch_type     = "FARGATE"
  
  depends_on      = [aws_lb_listener.http]

  network_configuration {
    subnets          = [aws_subnet.private_a.id, aws_subnet.private_b.id]
    security_groups  = [aws_security_group.app_sg.id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.frontend_tg.arn
    container_name   = "frontend"
    container_port   = 80
  }
}

# 7. CloudWatch Log Groups
resource "aws_cloudwatch_log_group" "backend_logs" {
  name              = "/ecs/backend-tf"
  retention_in_days = 7
}

resource "aws_cloudwatch_log_group" "frontend_logs" {
  name              = "/ecs/frontend-tf"
  retention_in_days = 7
}