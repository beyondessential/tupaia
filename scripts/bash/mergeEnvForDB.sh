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
caller_dir=$(get_caller_package_directory)

# Get the directory of this script
script_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)

# Fixed paths to the .env files for the test db
paths=(
    "$script_dir/../../env/db.env"
    "$script_dir/../../env/pg.env"
    "$script_dir/../../env/data-lake.env"
    "$caller_dir/.env"
)

# Keep only files that exist
common_files=()
for file in "${paths[@]}"; do
    if [[ -f $file ]]; then
        common_files+=("$file")
    fi
done

# Snapshot the environment before reading the .env files, so that variables which are already set
# (e.g. `DB_PORT=5433 yarn build-analytics-table`) can be given precedence afterwards
env_keys=()
env_values=()
while IFS= read -r key; do
    env_keys+=("$key")
    env_values+=("${!key}")
done < <(compgen -e)

if ((${#common_files[@]} > 0)); then
    eval "$(cat "${common_files[@]}")"
fi

# Reinstate the pre-existing environment, overwriting anything the .env files set. Values are
# assigned directly rather than evaluated as shell source, because they can contain quotes,
# whitespace and other characters that don’t survive a round trip through `eval`.
for i in "${!env_keys[@]}"; do
    # Readonly variables can’t be reassigned, but nor could the .env files have changed them
    printf -v "${env_keys[$i]}" '%s' "${env_values[$i]}" 2>/dev/null || true
done

if [[ $CI = true ]]; then
    echo '::endgroup::'
fi
