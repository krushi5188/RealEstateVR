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

# Run verification in headless mode (Standard)
echo "Running Standard Verification..."
xvfb-run -a ./ArchNative --test-screenshot

# Check if screenshot exists
if [ -f "test_output.png" ]; then
    echo "SUCCESS: Standard screenshot generated."
    mv test_output.png ../../test_output.png
else
    echo "FAILURE: No screenshot generated."
    exit 1
fi

# Run verification (Camera)
echo "Running Camera Verification..."
xvfb-run -a ./ArchNative --test-camera

if [ -f "test_cam_1.png" ] && [ -f "test_cam_2.png" ]; then
    echo "SUCCESS: Camera screenshots generated."
    mv test_cam_1.png ../../test_cam_1.png
    mv test_cam_2.png ../../test_cam_2.png

    # Simple check if files are different (proving rotation happened)
    if cmp -s ../../test_cam_1.png ../../test_cam_2.png; then
       echo "WARNING: Camera screenshots are identical. Rotation might have failed."
    else
       echo "SUCCESS: Camera rotation verified (Images differ)."
    fi
else
    echo "FAILURE: Camera screenshots missing."
    exit 1
fi
