# Terraform Configuration
# filepath: d:\AI Business Agent\ai-agentic-product\infrastructure\terraform\main.tf
provider "aws" {
    region = "us-east-1"
}

resource "aws_s3_bucket" "example" {
    bucket = "ai-agentic-product-bucket"
    acl    = "private"
}