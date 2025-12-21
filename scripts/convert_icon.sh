#!/bin/bash
# Usage: scripts/convert_icon.sh

# Configuration
INPUT_FILE="resources/icon_rounded.png"
OUTPUT_DIR="build"
MAC_OUTPUT_FILENAME="icon.icns"
WIN_OUTPUT_FILENAME="icon.ico"
LINUX_OUTPUT_FILENAME="icon.png"
TEMP_ICONSET="temp_icon.iconset" # Intermediate folder required by iconutil

# --- Pre-flight Checks ---

# 1. Check if input image exists
if [ ! -f "$INPUT_FILE" ]; then
    echo "Error: Could not find input file at '$INPUT_FILE'"
    echo "Make sure you are running this script from the 'Harrys-Password-Manager-Desktop' directory."
    exit 1
fi

# 2. Ensure output directory exists
if [ ! -d "$OUTPUT_DIR" ]; then
    echo "Build directory not found. Creating '$OUTPUT_DIR'..."
    mkdir -p "$OUTPUT_DIR"
fi

# Make icns file for macOS
echo "Generating temporary iconset from $INPUT_FILE..."
mkdir -p "$TEMP_ICONSET"

# Generate all standard macOS icon sizes
# 16x16
sips -z 16 16     "$INPUT_FILE" --out "${TEMP_ICONSET}/icon_16x16.png" > /dev/null
sips -z 32 32     "$INPUT_FILE" --out "${TEMP_ICONSET}/icon_16x16@2x.png" > /dev/null

# 32x32
sips -z 32 32     "$INPUT_FILE" --out "${TEMP_ICONSET}/icon_32x32.png" > /dev/null
sips -z 64 64     "$INPUT_FILE" --out "${TEMP_ICONSET}/icon_32x32@2x.png" > /dev/null

# 128x128
sips -z 128 128   "$INPUT_FILE" --out "${TEMP_ICONSET}/icon_128x128.png" > /dev/null
sips -z 256 256   "$INPUT_FILE" --out "${TEMP_ICONSET}/icon_128x128@2x.png" > /dev/null

# 256x256
sips -z 256 256   "$INPUT_FILE" --out "${TEMP_ICONSET}/icon_256x256.png" > /dev/null
sips -z 512 512   "$INPUT_FILE" --out "${TEMP_ICONSET}/icon_256x256@2x.png" > /dev/null

# 512x512
sips -z 512 512   "$INPUT_FILE" --out "${TEMP_ICONSET}/icon_512x512.png" > /dev/null
sips -z 1024 1024 "$INPUT_FILE" --out "${TEMP_ICONSET}/icon_512x512@2x.png" > /dev/null

echo "Packing .icns file..."

# Combine the temporary images into the final .icns file in the build folder
# -c icns : Convert to icns format
# -o      : Specify exact output path
iconutil -c icns "$TEMP_ICONSET" -o "${OUTPUT_DIR}/${MAC_OUTPUT_FILENAME}"

# Clean up
rm -r "$TEMP_ICONSET"

echo "Success! Generated: ${OUTPUT_DIR}/${MAC_OUTPUT_FILENAME}"

# Make ico file for Windows
ffmpeg -i "$INPUT_FILE" -vf scale=256:256 "${OUTPUT_DIR}/${WIN_OUTPUT_FILENAME}"
echo "Successfully created: ${OUTPUT_DIR}/${WIN_OUTPUT_FILENAME}"

# Copy png file for Linux
cp "$INPUT_FILE" "${OUTPUT_DIR}/${LINUX_OUTPUT_FILENAME}"
echo "Successfully created: ${OUTPUT_DIR}/${LINUX_OUTPUT_FILENAME}"
