#!/bin/bash

# Add node to the path
PATH=$PATH:/home/ubuntu/.nvm/versions/node/v9.11.0/bin

# Get script directory so that yarn knows where the root package.json is, no matter where it's called from
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd $SCRIPT_DIR

# Run the preaggregation
RUN_PREAGGREGATION=all yarn start
