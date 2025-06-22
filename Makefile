# Makefile for Kafka UI Project

.PHONY: help build-backend build-frontend build-all dev-backend dev-frontend dev-all test-backend test-frontend test-all clean docker-build docker-run docker-stop install-deps

# Default target
help:
	@echo "Kafka UI - Available commands:"
	@echo ""
	@echo "Development:"
	@echo "  dev-backend     - Start backend development server"
	@echo "  dev-frontend    - Start frontend development server"
	@echo "  dev-all         - Start both backend and frontend"
	@echo ""
	@echo "Building:"
	@echo "  build-backend   - Build backend binary"
	@echo "  build-frontend  - Build frontend for production"
	@echo "  build-all       - Build both backend and frontend"
	@echo ""
	@echo "Testing:"
	@echo "  test-backend    - Run backend tests"
	@echo "  test-frontend   - Run frontend tests"
	@echo "  test-all        - Run all tests"
	@echo ""
	@echo "Docker:"
	@echo "  docker-build    - Build Docker images"
	@echo "  docker-run      - Run with Docker Compose"
	@echo "  docker-stop     - Stop Docker containers"
	@echo ""
	@echo "Utilities:"
	@echo "  install-deps    - Install all dependencies"
	@echo "  clean           - Clean build artifacts"

# Development
dev-backend:
	@echo "Starting backend development server..."
	cd backend && go run cmd/server/main.go

dev-frontend:
	@echo "Starting frontend development server..."
	cd frontend && npm run dev

dev-all:
	@echo "Starting both backend and frontend..."
	@make -j2 dev-backend dev-frontend

# Building
build-backend:
	@echo "Building backend..."
	cd backend && go build -o bin/kafka-ui-server cmd/server/main.go

build-frontend:
	@echo "Building frontend..."
	cd frontend && npm run build

build-all: build-backend build-frontend

# Testing
test-backend:
	@echo "Running backend tests..."
	cd backend && go test ./...

test-frontend:
	@echo "Running frontend tests..."
	cd frontend && npm test

test-all: test-backend test-frontend

# Docker
docker-build:
	@echo "Building Docker images..."
	docker-compose build

docker-run:
	@echo "Starting Docker containers..."
	docker-compose up -d

docker-stop:
	@echo "Stopping Docker containers..."
	docker-compose down

# Utilities
install-deps:
	@echo "Installing backend dependencies..."
	cd backend && go mod download
	@echo "Installing frontend dependencies..."
	cd frontend && npm install

clean:
	@echo "Cleaning build artifacts..."
	rm -rf backend/bin
	rm -rf frontend/dist
	rm -rf frontend/node_modules/.cache 