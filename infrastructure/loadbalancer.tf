# 1. The Application Load Balancer (Public)
resource "aws_lb" "main" {
  name               = "cloudstore-alb-tf"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb_sg.id]
  # Must be placed in Public Subnets so the internet can reach it!
  subnets            = [aws_subnet.public_a.id, aws_subnet.public_b.id]

  tags = {
    Name = "cloudstore-alb-tf"
  }
}

# 2. Frontend Target Group
resource "aws_lb_target_group" "frontend_tg" {
  name        = "cloudstore-front-tg-tf"
  port        = 80
  protocol    = "HTTP"
  vpc_id      = aws_vpc.main.id
  target_type = "ip" # Required for ECS Fargate!
  
  health_check {
    path                = "/"
    healthy_threshold   = 2
    unhealthy_threshold = 5
  }
}

# 3. Backend Target Group
resource "aws_lb_target_group" "backend_tg" {
  name        = "cloudstore-back-tg-tf"
  port        = 5000
  protocol    = "HTTP"
  vpc_id      = aws_vpc.main.id
  target_type = "ip"
  
  health_check {
    path                = "/api/v1/health" # Our custom health check route
    healthy_threshold   = 2
    unhealthy_threshold = 5
  }
}

# 4. The Main Listener (Port 80)
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.main.arn
  port              = "80"
  protocol          = "HTTP"

  # By default, send all traffic to the React Frontend
  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.frontend_tg.arn
  }
}

# 5. The API Listener Rule
resource "aws_lb_listener_rule" "api_routing" {
  listener_arn = aws_lb_listener.http.arn
  priority     = 100 # Rules with lower numbers are evaluated first

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.backend_tg.arn
  }

  condition {
    path_pattern {
      values = ["/api/*"] # If URL contains /api/, send to Backend!
    }
  }
}