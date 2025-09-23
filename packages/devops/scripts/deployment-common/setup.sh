#!/usr/bin/env bash
# This script is invoked by setupGoldMaster.sh, which is used by EC2 Image Builder to pre-bake a
# Tupaia AMI.
#
# DEPLOYING CHANGES
#   Unlike setupGoldMaster.sh, the “live” version of this file lives in version control, and doesn’t
#   need to be uploaded to Amazon S3. To deploy changes:
#
#   1. Merge changes into the default branch.
#   2. Optionally, go to EC2 Image Builder → Image pipelines → Tupaia Gold Master and run the
#      pipeline. Left alone, this will happen automatically according to the image pipeline’s build
#      schedule. Do this step if you need changes to take effect immediately.
#
# REMARK
#   The EC2 Image Builder image pipeline always invokes the version of this script from the default
#   branch, regardless of whether you’ll be deploying from a feature branch.
#
# SEE ALSO
#   packages/devops/scripts/deployment-aws/setupGoldMaster.sh

set -e

HOME_DIR=/home/ubuntu
TUPAIA_DIR=$HOME_DIR/tupaia

cd $HOME_DIR

sudo apt-get update

# install nginx and add h5bp config
if ! command -v nginx &>/dev/null; then
  echo 'nginx not installed. Installing...'
  sudo apt-get install -yqq nginx

  git clone --branch 2.0.0 --depth 1 https://github.com/h5bp/server-configs-nginx.git
  sudo cp -R ./server-configs-nginx/h5bp/ /etc/nginx/
  rm -rf server-configs-nginx

  # Add the nginx user (www-data) to the ubuntu group to give it access to the tupaia code
  sudo usermod -a -G ubuntu www-data
fi
nginx -v

# install psql for use when installing mv refresh in the db
sudo apt-get install -yqq postgresql-client

# install base dependencies
sudo apt-get --no-install-recommends -yqq install \
  bash-completion \
  build-essential \
  cmake \
  libcurl4 \
  libcurl4-openssl-dev \
  libssl-dev \
  libxml2 \
  libxml2-dev \
  libssl3 \
  pkg-config \
  ca-certificates \
  xclip \
  jq

# Install base dependencies
# Note: Many of these are for puppeteer: https://pptr.dev/15.3.0/troubleshooting#chrome-headless-doesnt-launch-on-unix
sudo apt-get -yqq install \
  fonts-liberation \
  libappindicator3-1 \
  libasound2 \
  libatk-bridge2.0-0 \
  libatk1.0-0 \
  libc6 \
  libcairo2 \
  libcups2 \
  libdbus-1-3 \
  libexpat1 \
  libfontconfig1 \
  libgbm1 \
  libgcc1 \
  libglib2.0-0 \
  libgtk-3-0 \
  libnspr4 \
  libnss3 \
  libpango-1.0-0 \
  libpangocairo-1.0-0 \
  libstdc++6 \
  libx11-6 \
  libx11-xcb1 \
  libxcb1 \
  libxcomposite1 \
  libxcursor1 \
  libxdamage1 \
  libxext6 \
  libxfixes3 \
  libxi6 \
  libxrandr2 \
  libxrender1 \
  libxss1 \
  libxtst6 \
  lsb-release \
  wget \
  xdg-utils

install_tailscale() {
  if ! command -v tailscale &>/dev/null; then
    echo 'Tailscale not installed. Installing...'

    # See https://docs.aws.amazon.com/linux/al2023/ug/ident-os-release.html
    local os_id=$(source /etc/os-release && echo "$ID")
    local os_codename=$(source /etc/os-release && echo "$VERSION_CODENAME")

    sudo cp "$TUPAIA_DIR"/packages/devops/tailscale/tailscale-archive-keyring.gpg /usr/share/keyrings/tailscale.gpg
    echo "deb [signed-by=/usr/share/keyrings/tailscale.gpg] https://pkgs.tailscale.com/stable/$os_id $os_codename main" |
      sudo tee /etc/apt/sources.list.d/tailscale.list
    sudo apt-get update
    sudo apt-get -qq install tailscale
  else
    echo 'Updating Tailscale...'
    sudo tailscale update
  fi

  echo 'Tailscale version:'
  tailscale version
}
install_tailscale

# install node and yarn
if ! command -v node &>/dev/null; then
  echo 'nvm not installed. Installing...'
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
  export NVM_DIR="$HOME/.nvm"
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm
  nvm install $(sudo cat "$TUPAIA_DIR/.nvmrc")
  npm install --global yarn
fi
echo "nvm $(nvm --version) is installed"

# Install PM2, ensuring same version as root package.json
if ! command -v pm2 &>/dev/null; then
  echo 'PM2 not installed. Installing...'
  npm install --global pm2@^6.0.8
elif (($(yarn pm2 --version | cut -d . -f 1) != 6)); then
  echo "PM2 $(pm2 --version) is installed. Replacing with ^6.0.8..."
  npm install --global pm2@^6.0.8
fi
echo "PM2 $(pm2 --version) is installed"

pm2 install pm2-logrotate

LOGS_DIR=$HOME_DIR/logs
# Create a directory for logs to go
mkdir -m 777 -p $LOGS_DIR

cd $TUPAIA_DIR
yarn install # pre install to save time spinning up new ec2 instances
