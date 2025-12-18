#!/usr/bin/env bash
set -e

if [[ $CI = true ]]; then
    echo '::group::Load environment variables from .env files'
fi

# Function to get the directory of the package that's calling this script
get_caller_package_directory() {
    local dir
    dir=$(dirname "$(readlink -f "$0")")
    while [[ "$dir" != "/" ]]; do
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
file1="$CURRENT_DIR/../../env/db.env"
file2="$CURRENT_DIR/../../env/pg.env"
file3="$CURRENT_DIR/../../env/data-lake.env"
file4="$CALLING_SCRIPT_DIR/.env"

common_files="$file1 $file2 $file3 $file4"

# Remove files that don't exist
for file in $common_files; do
    if [ ! -f "$file" ]; then
        common_files=$(echo "$common_files" | sed "s|$file||g")
    fi
done

# Load environment variables from .env files
merged_content="$(cat $common_files)"

# Process command line arguments, overwriting values if present
for var in $(env); do
    if [[ "$var" == *=* ]]; then
        key="${var%%=*}"
        value="${var#*=}"
        # Override values from command line
        merged_content+=" $key=\"$value\""
    fi
done

# Evaluate merged content to set variables
eval "$merged_content"

if [[ $CI = true ]]; then
    echo '::endgroup::'
fi
