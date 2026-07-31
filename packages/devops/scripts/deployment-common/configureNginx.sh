#!/bin/bash -le

HOME_DIR=/home/ubuntu
CONFIG_DIR=$HOME_DIR/tupaia/packages/devops/configs
TEMPLATE_DIR=$CONFIG_DIR/nginx-template

# Ensure the brotli static module is present before writing config that uses brotli_static.
# Covers instances launched from AMIs baked before the module was added to setup.sh.
if [[ ! -f /usr/lib/nginx/modules/ngx_http_brotli_static_module.so ]]; then
  echo 'Installing libnginx-mod-http-brotli-static...'
  sudo apt-get update -qq
  sudo apt-get install -yqq libnginx-mod-http-brotli-static
fi

# configure nginx
if [[ $DEPLOYMENT_NAME == "production" ]]; then
  DOMAIN_PREFIX=""
  SUBDOMAIN_PREFIX=""
else
  DOMAIN_PREFIX="$DEPLOYMENT_NAME."
  SUBDOMAIN_PREFIX="$DEPLOYMENT_NAME-"
fi

if [ "$USE_SSL" = true ]; then
  PORT="443 ssl http2"
else
  PORT="80"
fi

if [ "$USE_SSL" = true ]; then
  HTTPS_CONFIG_FILE=$TEMPLATE_DIR/https-config-ssl.snippet
else
  HTTPS_CONFIG_FILE=$TEMPLATE_DIR/https-config-non-ssl.snippet
fi

sed -e "/__HTTPS_CONFIG__/r $HTTPS_CONFIG_FILE" -e "s/__HTTPS_CONFIG__//g" $TEMPLATE_DIR/servers.template.conf >$HOME_DIR/servers.conf
sed -i "s/__DEFAULT_FRONTEND__/$DEFAULT_FRONTEND/g" $HOME_DIR/servers.conf
sed -i "s/__DOMAIN_PREFIX__/$DOMAIN_PREFIX/g" $HOME_DIR/servers.conf
sed -i "s/__SUBDOMAIN_PREFIX__/$SUBDOMAIN_PREFIX/g" $HOME_DIR/servers.conf
sed -i "s/__DOMAIN__/$DOMAIN/g" $HOME_DIR/servers.conf
sed -i "s/__PORT__/$PORT/g" $HOME_DIR/servers.conf

sudo cp $CONFIG_DIR/nginx.conf /etc/nginx/nginx.conf
sudo cp $HOME_DIR/servers.conf /etc/nginx/conf.d/servers.conf

rm $HOME_DIR/servers.conf
