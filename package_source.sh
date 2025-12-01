#!/bin/bash
set -e

echo "Packaging ArchNative Source..."

VERSION="1.0"
PACKAGE_NAME="ArchNative_Source_v$VERSION"
OUTPUT_DIR="dist"

# Clean previous
rm -rf "$OUTPUT_DIR"
mkdir -p "$OUTPUT_DIR/$PACKAGE_NAME"

# Copy essential files
cp -r ArchNative "$OUTPUT_DIR/$PACKAGE_NAME/"
cp PROJECT_ROADMAP.md "$OUTPUT_DIR/$PACKAGE_NAME/"
cp HANDOVER_TO_CPP.md "$OUTPUT_DIR/$PACKAGE_NAME/"
cp BUILD_INSTRUCTIONS.md "$OUTPUT_DIR/$PACKAGE_NAME/"

# Remove build artifacts from the source package
rm -rf "$OUTPUT_DIR/$PACKAGE_NAME/ArchNative/build"
rm -rf "$OUTPUT_DIR/$PACKAGE_NAME/ArchNative/cmake-build-debug"

# Create ZIP
cd "$OUTPUT_DIR"
zip -r "$PACKAGE_NAME.zip" "$PACKAGE_NAME"

echo "Package created at $OUTPUT_DIR/$PACKAGE_NAME.zip"
