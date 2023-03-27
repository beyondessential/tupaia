#!/bin/bash -e

SCRIPT_DIR=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )
cd "$SCRIPT_DIR"
cd ../../../..

if git diff-index --quiet HEAD packages/types; then
  echo "Schema and @tupaia/types are in sync"
  exit 0
else
  echo "❌ There are changes in the schema which are not reflected in @tupaia/types."
  echo ""
  echo "Run yarn workspace @tupaia/types generate to fix"
  echo ""
  echo "Diff:"
  git --no-pager diff packages/types
  echo "Exiting build"
  exit 1
fi
