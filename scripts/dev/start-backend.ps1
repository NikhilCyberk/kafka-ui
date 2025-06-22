# PowerShell script to start the Kafka UI backend in development mode

Write-Host "Starting Kafka UI Backend..." -ForegroundColor Green

# Change to backend directory
Set-Location "backend"

# Check if Go is installed
try {
    $goVersion = go version
    Write-Host "Go version: $goVersion" -ForegroundColor Cyan
} catch {
    Write-Host "Error: Go is not installed or not in PATH" -ForegroundColor Red
    exit 1
}

# Download dependencies if needed
Write-Host "Downloading dependencies..." -ForegroundColor Yellow
go mod download

# Run the backend server
Write-Host "Starting server on http://localhost:8080" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow

go run cmd/server/main.go 