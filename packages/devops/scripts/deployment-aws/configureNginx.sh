#!/bin/bash -e

DIR=$(dirname "$0")
TUPAIA_DIR=$DIR/../../../..

# Stop nginx
service nginx stop

# Copy servers.conf to proper nginx location
export DEFAULT_FRONTEND=tupaia-web
export DOMAIN=tupaia.org
export USE_SSL=false
"$TUPAIA_DIR/packages/devops/scripts/deployment-common/configureNginx.sh"

cp ${TUPAIA_DIR}/packages/devops/misc/error_page.html ${TUPAIA_DIR}/error_page.html

# Restart nginx
service nginx start
