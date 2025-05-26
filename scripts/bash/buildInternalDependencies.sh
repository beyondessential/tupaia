#!/usr/bin/env bash
set -e

script_dir=$(dirname "$0")
package_names_glob=$("$script_dir/getInternalDependencies.sh" --as-glob)

# Build!

set -x
NODE_ENV=production \
    yarn workspaces foreach \
    --parallel \
    --topological \
    --verbose \
    --jobs unlimited \
    --include "$package_names_glob" \
    run build-dev \
    "$@" # Forward arguments (mostly for --watch flag)
