#!/bin/bash
set -e

# Define build directory
BUILD_DIR="ArchNative/build"

# Clean and create build directory
rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR"

# Configure with CMake
echo "Configuring..."
cd "$BUILD_DIR"
cmake ..

# Build
echo "Building..."
make -j$(nproc)

# Run verification in headless mode
echo "Running Verification..."
xvfb-run -a ./ArchNative --test-screenshot

# Check if screenshot exists
if [ -f "test_output.png" ]; then
    echo "SUCCESS: Screenshot generated."
    mv test_output.png ../../test_output.png
    exit 0
else
    echo "FAILURE: No screenshot generated."
    exit 1
fi
