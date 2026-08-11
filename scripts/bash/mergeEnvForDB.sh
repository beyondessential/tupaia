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

# Snapshot the environment before reading the .env files, so that variables which are already set
# (e.g. `DB_PORT=5433 yarn build-analytics-table`) can be given precedence afterwards
env_snapshot=()
while IFS= read -r -d '' var; do
    env_snapshot+=("$var")
done < <(env -0)

# Load environment variables from .env files
eval "$(cat $common_files)"

# Reinstate the pre-existing environment, overwriting anything the .env files set. Values are
# assigned directly rather than evaluated as shell source, because they can contain quotes,
# whitespace and other characters that don’t survive a round trip through `eval`.
for var in "${env_snapshot[@]}"; do
    key="${var%%=*}"
    # Skip exported shell functions, and anything else that isn’t a valid variable name
    [[ $key =~ ^[a-zA-Z_][a-zA-Z0-9_]*$ ]] || continue
    # Readonly variables can’t be reassigned, but nor could the .env files have changed them
    printf -v "$key" '%s' "${var#*=}" 2>/dev/null || true
done

if [[ $CI = true ]]; then
    echo '::endgroup::'
fi
