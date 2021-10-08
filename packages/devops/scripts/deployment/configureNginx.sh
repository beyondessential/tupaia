#!/bin/bash -e

# Stop nginx
service nginx stop

# Copy servers.conf to proper nginx location
cp ${HOME_DIRECTORY}/packages/devops/configs/servers.conf /etc/nginx/conf.d/servers.conf

cp ${HOME_DIRECTORY}/packages/devops/misc/error_page.html ${HOME_DIRECTORY}/error_page.html

# Restart nginx
service nginx start
