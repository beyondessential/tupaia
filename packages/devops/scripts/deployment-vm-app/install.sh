#!/bin/bash -ex

HOME_DIR=/home/ubuntu
TUPAIA_DIR=$HOME_DIR/tupaia
LOGS_DIR=$HOME_DIR/logs

SCRIPT_DIR=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )
cd "$SCRIPT_DIR"

./checkRequiredEnvVars.sh

set -x

# configure nginx
DOMAIN_REGEX_ESCAPED=$(printf '%s\n' "$DOMAIN" | sed -e 's/[]\/$*.^[]/\\&/g');
DOMAIN_REGEX_DOUBLE_ESCAPED=$(printf '%s\n' "$DOMAIN_REGEX_ESCAPED" | sed -e 's/[]\/$*.^[]/\\&/g');
sed "s/__DOMAIN__/$DOMAIN/g" $HOME_DIR/configs/servers.template.conf > $HOME_DIR/configs/servers.conf
sed -i "s/__DOMAIN_REGEX_ESCAPED__/$DOMAIN_REGEX_DOUBLE_ESCAPED/g" $HOME_DIR/configs/servers.conf
sudo cp $HOME_DIR/configs/nginx.conf /etc/nginx/nginx.conf
sudo cp $HOME_DIR/configs/servers.conf /etc/nginx/conf.d/servers.conf

# Add certbot
#  (following https://certbot.eff.org/instructions?ws=nginx&os=ubuntubionic)
sudo snap install core
sudo snap refresh core
sudo snap install --classic certbot
sudo snap set certbot trust-plugin-with-root=ok

# clone our repo
mkdir -p $TUPAIA_DIR
cd $TUPAIA_DIR
git status || git clone -b $GIT_BRANCH $GIT_REPO .
git remote set-branches --add origin ${GIT_BRANCH}
git fetch --all --prune
git reset --hard # clear out any manual changes that have been made, which would cause checkout to fail
git checkout ${GIT_BRANCH}
git reset --hard origin/${GIT_BRANCH}

# Yarn install
yarn install --frozen-lockfile

# Fetch env vars
echo "Note: if lastpass fails, check email account $LASTPASS_EMAIL for a verification check"
LASTPASS_EMAIL=$LASTPASS_EMAIL LASTPASS_PASSWORD=$LASTPASS_PASSWORD yarn download-env-vars $DEPLOYMENT_NAME

# Build
yarn build:internal-dependencies

echo "Building deployable packages"
PACKAGES=$(${TUPAIA_DIR}/scripts/bash/getDeployablePackages.sh)
for PACKAGE in ${PACKAGES[@]}; do
    echo "Building ${PACKAGE}"
    REACT_APP_DEPLOYMENT_NAME=${DEPLOYMENT_NAME} yarn workspace @tupaia/${PACKAGE} build
done

echo "Tupaia installed successfully"