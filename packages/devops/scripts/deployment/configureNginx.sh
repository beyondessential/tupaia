#!/bin/bash

# Stop nginx
sudo service nginx stop

# Copy servers.conf to proper nginx location
sudo cp ${HOME_DIRECTORY}/tupaia-devops/configs/servers.conf /etc/nginx/conf.d/servers.conf

cp ${HOME_DIRECTORY}/tupaia-devops/misc/error_page.html ${HOME_DIRECTORY}/error_page.html

# Restart nginx
sudo service nginx start
