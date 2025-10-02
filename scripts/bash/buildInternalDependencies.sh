#!/usr/bin/env bash
set -e

script_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)
package_names_glob=$("$script_dir/getInternalDependencies.sh" --as-glob)

# Build!

set -x
NODE_ENV=production \
    yarn workspaces foreach \
    --parallel \
    --topological \
    --verbose --verbose \
    --jobs unlimited \
    --include "@tupaia/$package_names_glob" \
    run build-dev \
    "$@" # Forward arguments (mostly for --watch flag)
