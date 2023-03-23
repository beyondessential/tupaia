#!/bin/bash -e

DIR=$(dirname "$0")
TUPAIA_DIR=$DIR/../../../..

# Stop nginx
service nginx stop

# Copy servers.conf to proper nginx location
cp ${TUPAIA_DIR}/packages/devops/configs/nginx.conf /etc/nginx/nginx.conf
cp ${TUPAIA_DIR}/packages/devops/configs/servers.conf /etc/nginx/conf.d/servers.conf

cp ${TUPAIA_DIR}/packages/devops/misc/error_page.html ${TUPAIA_DIR}/error_page.html

# Restart nginx
service nginx start
