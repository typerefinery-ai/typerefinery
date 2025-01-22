#!/bin/bash

# Check if both source and target files are provided
if [ $# -ne 2 ]; then
    echo "Usage: $0 source.json target.json"
    exit 1
fi

# Assign parameters to variables
SOURCE="$1"
TARGET="$2"
TEMP="temp.json"

# Generate timestamp in YYYYMMDDHHMMSS format
TIMESTAMP=$(date +"%Y%m%d%H%M%S")

# Check if the target file exists
if [ ! -f "$TARGET" ]; then
    echo "Target file '$TARGET' not found. Copying source to target..."
    cp "$SOURCE" "$TARGET" || { echo "Failed to copy '$SOURCE' to '$TARGET'."; exit 1; }
    echo "Source file successfully copied to target."
    exit 0
fi

# Create the backup filename as <target>.timestamp.back
BACKUP="${TARGET}.${TIMESTAMP}.back"

echo "Creating a backup of '${TARGET}'..."
cp "$TARGET" "$BACKUP" || { echo "Failed to create backup as '$BACKUP'."; exit 1; }
echo "Backup created: $BACKUP"

# Ensure target.json exists or create an empty JSON object
if [ ! -f "$TARGET" ]; then
    echo "Creating an empty target file..."
    echo '{}' > "$TARGET"
fi

echo "Extracting existing keys from '$TARGET'..."
jq -r 'keys[]' "$TARGET" > target_keys.txt || { echo "Error extracting keys."; exit 1; }

echo "Initializing a temporary file..."
echo '{}' > "$TEMP"

echo "Processing each key-value pair in '$SOURCE'..."
jq -c 'to_entries[]' "$SOURCE" | while read -r entry; do
    key=$(echo "$entry" | jq -r '.key')
    value=$(echo "$entry" | jq -c '.value')
    id=$(echo "$value" | jq -r '.id')

    echo "Checking if key '$key' matches ID '$id'..."
    if [ "$key" == "$id" ]; then
        echo "Key '$key' matches ID, checking if it exists in the target..."
        if ! grep -qx "$key" target_keys.txt; then
            echo "Adding key '$key' to the temp file..."
            echo "{\"$key\": $value}" > pair.json

            # Merge the new key-value pair into the temp JSON
            jq -s '.[0] * .[1]' "$TEMP" pair.json > "${TEMP}.tmp" && mv "${TEMP}.tmp" "$TEMP"
            rm pair.json
        else
            echo "Key '$key' already exists, skipping."
        fi
    else
        echo "Key '$key' does not match its ID, skipping."
    fi
done

echo "Merging updated objects into '$TARGET'..."
jq -s 'add' "$TARGET" "$TEMP" > "${TARGET}.tmp" && mv "${TARGET}.tmp" "$TARGET"

echo "Cleaning up temporary files..."
rm target_keys.txt "$TEMP"

echo "All matching objects inserted successfully!"
