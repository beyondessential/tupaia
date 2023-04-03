#!/bin/bash -e

SCRIPT_DIR=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )
cd "$SCRIPT_DIR"
cd ../../../..

# Re-generate
yarn workspace @tupaia/types generate:models

# Check for changes
typesdiff=$(git diff --color packages/types)

if [ -z "$typesdiff" ]; then
  echo "Schema and @tupaia/types are in sync"
  exit 0
else
  echo "❌ There are changes in the schema which are not reflected in @tupaia/types."
  echo ""
  echo "Run 'yarn workspace @tupaia/types generate' to fix"
  echo ""
  echo "Diff:"
  echo "$typesdiff"
  exit 1
fi
