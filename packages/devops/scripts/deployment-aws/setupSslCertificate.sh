#!/bin/bash -e

HOME_DIR=/home/ubuntu

DEPLOYMENT_NAME=$1
DOMAIN=$2
SUBDOMAINS=$3

if [[ $DEPLOYMENT_NAME == "production" ]]; then
  DOMAIN_PREFIX=""
  SUBDOMAIN_PREFIX=""
else
  DOMAIN_PREFIX="$DEPLOYMENT_NAME."
  SUBDOMAIN_PREFIX="$DEPLOYMENT_NAME-"
fi

cd $HOME_DIR

sudo snap install lego

LEGO_COMMAND="sudo lego --email=\"tupaia@$DOMAIN_PREFIX$DOMAIN\" -d $DOMAIN_PREFIX$DOMAIN"

# Certificate must have all subdomains registered
for SUBDOMAIN in ${SUBDOMAINS//,/ }
do
    LEGO_COMMAND="$LEGO_COMMAND -d $SUBDOMAIN_PREFIX$SUBDOMAIN.$DOMAIN"
done

LEGO_COMMAND="$LEGO_COMMAND --http run"

echo "Running: $LEGO_COMMAND"

# Prompt may require Yes
eval "yes | $LEGO_COMMAND"

sudo mkdir /etc/ssl/tupaia.org
sudo cp /var/snap/lego/common/.lego/certificates/$DOMAIN_PREFIX$DOMAIN.crt /etc/ssl/tupaia.org/fullchain.pem
sudo cp /var/snap/lego/common/.lego/certificates/$DOMAIN_PREFIX$DOMAIN.key /etc/ssl/tupaia.org/privkey.pem