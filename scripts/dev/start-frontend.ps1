# PowerShell script to start the Kafka UI frontend in development mode

Write-Host "Starting Kafka UI Frontend..." -ForegroundColor Green

# Change to frontend directory
Set-Location "frontend"

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "Node.js version: $nodeVersion" -ForegroundColor Cyan
} catch {
    Write-Host "Error: Node.js is not installed or not in PATH" -ForegroundColor Red
    exit 1
}

# Check if npm is installed
try {
    $npmVersion = npm --version
    Write-Host "npm version: $npmVersion" -ForegroundColor Cyan
} catch {
    Write-Host "Error: npm is not installed or not in PATH" -ForegroundColor Red
    exit 1
}

# Install dependencies if node_modules doesn't exist
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Start the development server
Write-Host "Starting development server on http://localhost:5173" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow

npm run dev 