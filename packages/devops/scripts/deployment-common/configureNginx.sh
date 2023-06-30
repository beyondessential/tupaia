#!/bin/bash -le

# configure nginx
DOMAIN_REGEX_ESCAPED=$(printf '%s\n' "$DOMAIN" | sed -e 's/[]\/$*.^[]/\\&/g');
DOMAIN_REGEX_DOUBLE_ESCAPED=$(printf '%s\n' "$DOMAIN_REGEX_ESCAPED" | sed -e 's/[]\/$*.^[]/\\&/g');

# Setup non-ssl
sed "s/__DEFAULT_FRONTEND__/$DEFAULT_FRONTEND/g" $HOME_DIR/configs/servers-non-ssl.template.conf > $HOME_DIR/configs/servers-non-ssl.conf
sed -i "s/__DOMAIN__/$DOMAIN/g" $HOME_DIR/configs/servers-non-ssl.conf
sed -i "s/__DOMAIN_REGEX_ESCAPED__/$DOMAIN_REGEX_DOUBLE_ESCAPED/g" $HOME_DIR/configs/servers-non-ssl.conf

# Setup ssl
sed "s/__DEFAULT_FRONTEND__/$DEFAULT_FRONTEND/g" $HOME_DIR/configs/servers-ssl.template.conf > $HOME_DIR/configs/servers-ssl.conf
sed -i "s/__DOMAIN__/$DOMAIN/g" $HOME_DIR/configs/servers-ssl.conf
sed -i "s/__DOMAIN_REGEX_ESCAPED__/$DOMAIN_REGEX_DOUBLE_ESCAPED/g" $HOME_DIR/configs/servers-ssl.conf


sudo cp $HOME_DIR/configs/nginx.conf /etc/nginx/nginx.conf
if [ "$USE_SSL" = true ] then
    sudo cp $HOME_DIR/configs/servers-ssl.conf /etc/nginx/conf.d/servers.conf
else
    sudo cp $HOME_DIR/configs/servers-non-ssl.conf /etc/nginx/conf.d/servers.conf
fi
