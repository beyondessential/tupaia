#!/usr/bin/env bash
set -e

# Function to get the directory of the package that's calling this script
get_caller_package_directory() {
    local dir
    dir=$(dirname "$(readlink -f "$0")")
    while [[ $dir != '/' ]]; do
        if [[ -f "$dir/package.json" ]]; then
            echo "$dir"
            return
        fi
        dir=$(dirname "$dir")
    done
}

# Get the directory of the package that's calling this script
CALLING_SCRIPT_DIR=$(get_caller_package_directory)

# Get the directory of this script
CURRENT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)

# Fixed paths to the .env files for the test db
common_files=(
    './../../env/db.env'
    './../../env/pg.env'
    './../../env/data-lake.env'
    './.env'
)

# Load environment variables from .env files (if they exist)
merged_content=$(
    for file in "${common_files[@]}"; do
        if [[ -f $file ]]; then
            cat "$file"
        fi
    done
)

# Process command line arguments, overwriting values if present
for var in $(env); do
    if [[ $var = *=* ]]; then
        key="${var%%=*}"
        value="${var#*=}"
        # Override values from command line, with each variable on its own line
        merged_content+="
$key=\"$value\""
    fi
done

# Evaluate merged content to set variables
eval "$merged_content"
