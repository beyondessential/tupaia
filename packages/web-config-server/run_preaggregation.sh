#!/bin/bash

# Add node to the path
export PATH=/home/ubuntu/.local/bin:/home/ubuntu/.yarn/bin:/home/ubuntu/.config/yarn/global/node_modules/.bin:/home/ubuntu/.nvm/versions/node/v12.18.3/bin:/usr/local/bin:$PATH

# Get script directory so that yarn knows where the root package.json is, no matter where it's called from
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd $SCRIPT_DIR

# Run the preaggregation
RUN_PREAGGREGATION=all yarn start
