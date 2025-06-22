#!/bin/bash

# Build script for Kafka UI Backend

set -e

echo "Building Kafka UI Backend..."

# Set build variables
BUILD_DIR="bin"
BINARY_NAME="kafka-ui-server"
VERSION=$(git describe --tags --always --dirty 2>/dev/null || echo "dev")

# Create build directory
mkdir -p $BUILD_DIR

# Build for current platform
echo "Building for $(go env GOOS)/$(go env GOARCH)..."
go build -ldflags "-X main.version=$VERSION" -o "$BUILD_DIR/$BINARY_NAME" ./cmd/server

echo "Build completed successfully!"
echo "Binary location: $BUILD_DIR/$BINARY_NAME"
echo "Version: $VERSION" 