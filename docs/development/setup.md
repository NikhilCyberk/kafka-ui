# Development Setup Guide

This guide will walk you through setting up the Kafka UI project for local development.

## 1. Prerequisites

- **Go 1.21+** ([Download](https://golang.org/dl/))
- **Node.js 18+** ([Download](https://nodejs.org/))
- **Docker & Docker Compose** ([Download](https://www.docker.com/))
- **Git** ([Download](https://git-scm.com/))
- **A running Kafka cluster**

## 2. Initial Setup

### Clone the Repository
```bash
git clone <repository-url>
cd kafka-ui
```

### Install Dependencies
```bash
# This command will install both backend and frontend dependencies.
make install-deps
```

## 3. Backend Configuration

The backend requires a `config.yml` file to connect to a database and configure JWT authentication.

### Create the Configuration File
Rename the example configuration file:
```bash
mv backend/config.example.yml backend/config.yml
```

### Configure the Database
The application uses a PostgreSQL database for user management. The easiest way to get a database running is with Docker:
```bash
docker-compose up -d postgres
```
This will start a PostgreSQL container and expose it on port `5432`. The default `config.yml` is already configured to connect to this database.

### Configure JWT
You must set a secret key for signing JWT tokens. Open `backend/config.yml` and change the `jwt_secret` to a long, random string.

**Example `config.yml`:**
```yaml
database:
  host: "localhost"
  port: 5432
  user: "admin"
  password: "password"
  dbname: "kafka_ui_db"

jwt:
  secret: "your-very-secret-and-long-jwt-key" # CHANGE THIS

server:
  port: 8080
```

## 4. Running the Application

### Option 1: Using Docker (Recommended)
The simplest way to run the full stack is with Docker Compose. This will start the backend, frontend, and the database.

```bash
# This command builds the images and starts all services.
docker-compose up --build -d
```
- The frontend will be available at `http://localhost:5173`.
- The backend API will be at `http://localhost:8080`.

### Option 2: Running Manually

If you prefer to run the services manually:

**Start the Backend:**
```bash
cd backend
go run cmd/server/main.go
```

**Start the Frontend:**
In a separate terminal:
```bash
cd frontend
npm run dev
```

## 5. Development Workflow

### Adding a Kafka Cluster
Once the application is running, you can add your Kafka cluster through the UI. Navigate to the dashboard, and you will be prompted to add a cluster if none are configured.

### Backend Development
- **File Location**: `backend/`
- **Run Tests**: `make test-backend`
- **Build Binary**: `make build-backend`

### Frontend Development
- **File Location**: `frontend/`
- **Run Tests**: `make test-frontend`
- **Build Static Files**: `make build-frontend`

## 6. Code Quality

To maintain code quality, please use the following commands before committing:

- **Backend Formatting**: `go fmt ./...`
- **Frontend Linting**: `npm run lint`

## Development Workflow

### Backend Development

1. **Start the backend server:**
   ```bash
   cd backend
   go run cmd/server/main.go
   ```

2. **Run tests:**
   ```bash
   cd backend
   go test ./...
   ```

3. **Build for production:**
   ```bash
   cd backend
   go build -o bin/server cmd/server/main.go
   ```

### Frontend Development

1. **Start the development server:**
   ```bash
   cd frontend
   npm run dev
   ```

2. **Run tests:**
   ```bash
   cd frontend
   npm test
   ```

3. **Build for production:**
   ```bash
   cd frontend
   npm run build
   ```

## Configuration

### Backend Configuration

The backend configuration is in `backend/config.yml`:

```yaml
server:
  port: 8080
  host: "0.0.0.0"

kafka:
  default_cluster: "local"
  clusters:
    - name: "local"
      bootstrap_servers: "localhost:9092"
      zookeeper: "localhost:2181"
```

### Frontend Configuration

The frontend uses environment variables. Create `.env.local` in the frontend directory:

```env
VITE_API_URL=http://localhost:8080/api
VITE_APP_NAME=Kafka UI
```

## Docker Development

### Start with Docker Compose

```bash
# Start the full stack including Kafka
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Individual Services

```bash
# Build images
make docker-build

# Run backend only
docker-compose up backend

# Run frontend only
docker-compose up frontend
```

## Testing

### Backend Tests

```bash
cd backend

# Run all tests
go test ./...

# Run specific test
go test ./internal/kafka

# Run with coverage
go test -cover ./...
```

### Frontend Tests

```bash
cd frontend

# Run tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```

## Code Quality

### Backend

```bash
cd backend

# Format code
go fmt ./...

# Run linter
golangci-lint run

# Run vet
go vet ./...
```

### Frontend

```bash
cd frontend

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Type check (if using TypeScript)
npm run type-check
```

## Debugging

### Backend Debugging

1. **Using VS Code:**
   - Install Go extension
   - Set breakpoints in your code
   - Press F5 to start debugging

2. **Using Delve:**
   ```bash
   cd backend
   dlv debug cmd/server/main.go
   ```

### Frontend Debugging

1. **Browser DevTools:**
   - Open browser DevTools (F12)
   - Set breakpoints in Sources tab
   - Use React DevTools extension

2. **VS Code:**
   - Install Debugger for Chrome extension
   - Configure launch.json for debugging

## Common Issues

### Backend Issues

1. **Port already in use:**
   ```bash
   # Find process using port 8080
   lsof -i :8080
   # Kill process
   kill -9 <PID>
   ```

2. **Kafka connection issues:**
   - Ensure Kafka is running
   - Check bootstrap servers configuration
   - Verify network connectivity

### Frontend Issues

1. **Node modules issues:**
   ```bash
   cd frontend
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Build issues:**
   ```bash
   cd frontend
   npm run build --verbose
   ```

## Next Steps

- Read the [API Documentation](../api/README.md)
- Check the [Contributing Guidelines](./contributing.md)
- Review the [Deployment Guide](../deployment/production.md) 