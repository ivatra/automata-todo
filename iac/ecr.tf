resource "aws_ecr_repository" "automata_todo_api" {
  name = "automata_todo_api"

  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    IaC = "True"
  }
}

resource "aws_ecr_repository" "automata_todo_web" {
  name = "automata_todo_web"

  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    IaC = "True"
  }
}