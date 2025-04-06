#!/usr/bin/env bash
set -e

DIR=$(dirname "$0")
REPO_ROOT=$DIR/../..

# Convert 'foo-bar baz' → '@tupaia/{foo-bar,baz}'.
# Assume INTERNAL_DEPS is a valid space-separated list of package names, and use
# Bash parameter expansion to replace spaces with commas.
INTERNAL_DEPS=$("$DIR/getInternalDependencies.sh")
INTERNAL_DEPS_CSV=${INTERNAL_DEPS// /,}
PATTERN=@tupaia/{$INTERNAL_DEPS_CSV}

# Build!

set -x
NODE_ENV=production \
    yarn workspaces foreach \
    --parallel \
    --topological \
    --verbose \
    --jobs unlimited \
    --include "$PATTERN" \
    run build-dev \
    $@ # Forward arguments (mostly for --watch flag)
