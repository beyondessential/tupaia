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

install_nginx() {
  # Stable branch from nginx.org. Patch releases are picked up automatically; bump this to move to
  # a new stable branch. See https://nginx.org/en/linux_packages.html
  local nginx_branch=1.30

  local os_codename=$(source /etc/os-release && echo "$VERSION_CODENAME")

  sudo cp "$TUPAIA_DIR"/packages/devops/keyrings/nginx.gpg /usr/share/keyrings/nginx.gpg
  echo "deb [signed-by=/usr/share/keyrings/nginx.gpg] https://nginx.org/packages/ubuntu $os_codename nginx" |
    sudo tee /etc/apt/sources.list.d/nginx.list
  # Prefer the pinned nginx.org branch over Ubuntu’s own (older) nginx package
  printf 'Package: nginx\nPin: version %s.*\nPin-Priority: 1001\n' "$nginx_branch" |
    sudo tee /etc/apt/preferences.d/99nginx
  sudo apt-get update

  # Also replaces Ubuntu’s nginx-core and nginx-common, if installed. Config files are overwritten
  # by configureNginx.sh at deploy time, so take the package’s versions.
  echo "Installing nginx $nginx_branch.x..."
  sudo apt-get install -yqq -o Dpkg::Options::=--force-confnew nginx

  # The nginx.org package ships a default server, which would be picked up by conf.d/*.conf
  sudo rm -f /etc/nginx/conf.d/default.conf

  # add h5bp config
  if [ ! -d /etc/nginx/h5bp ]; then
    git clone --branch 2.0.0 --depth 1 https://github.com/h5bp/server-configs-nginx.git
    sudo cp -R ./server-configs-nginx/h5bp/ /etc/nginx/
    rm -rf server-configs-nginx
  fi

  # Add the nginx user (www-data) to the ubuntu group to give it access to the tupaia code
  sudo usermod -a -G ubuntu www-data

  nginx -v
}

install_psql() {
  # install psql for use when installing mv refresh in the db
  sudo apt-get install -yqq postgresql-client
}

install_base_dependencies() {
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
  # Note: Many of these are for puppeteer: https://pptr.dev/troubleshooting#chrome-doesnt-launch-on-linux
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
}

install_tailscale() {
  if ! command -v tailscale &>/dev/null; then
    echo 'Tailscale not installed. Installing...'

    # See https://docs.aws.amazon.com/linux/al2023/ug/ident-os-release.html
    local os_id=$(source /etc/os-release && echo "$ID")
    local os_codename=$(source /etc/os-release && echo "$VERSION_CODENAME")

    sudo cp "$TUPAIA_DIR"/packages/devops/keyrings/tailscale.gpg /usr/share/keyrings/tailscale.gpg
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

install_nvm() {
  local nvm_path="$HOME/.nvm/nvm.sh"
  if [ ! -s "$nvm_path" ]; then
    echo 'nvm not installed. Installing...'
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.6/install.sh | bash
  fi
  export NVM_DIR="$HOME/.nvm"
  [ -s "$nvm_path" ] && \. "$nvm_path"
  echo "nvm $(nvm --version) is installed"
}

install_node() {
  local target_version=$(sudo cat "$TUPAIA_DIR/.nvmrc")
  echo "Installing Node.js $target_version"
  nvm install --default "$target_version"
  echo "Using Node.js $(nvm current) ($(nvm which current))"
}

install_corepack() {
  if ! command -v corepack &>/dev/null; then
    echo 'Corepack not installed. Installing...'
    npm install --global --min-release-age=7 corepack
  fi
  echo "Corepack $(corepack --version) is installed"
}

install_pm2() {
  # Ideally match version in root package.json, which devs use locally
  if ! command -v pm2 &>/dev/null; then
    echo 'PM2 not installed. Installing...'
    npm install --global pm2@^7.0.3
  elif (($(pm2 --version | cut -d . -f 1) != 7)); then
    echo "PM2 $(pm2 --version) is installed. Replacing with ^7.0.3..."
    npm install --global pm2@^7.0.3
  fi
  echo "PM2 $(pm2 --version) is installed"

  pm2 install pm2-logrotate
}

create_logs_dir() {
  local logs_dir=$HOME_DIR/logs
  mkdir -m 777 -p "$logs_dir"
}

set_up_yarn() {
  corepack enable yarn
  echo "Using Yarn $(yarn --version) ($(which yarn))"
}

main() {
  cd $HOME_DIR

  sudo apt-get update
  install_nginx
  install_psql
  install_base_dependencies
  install_tailscale
  install_nvm
  install_node
  install_corepack
  install_pm2

  create_logs_dir

  cd "$TUPAIA_DIR"
  set_up_yarn
  yarn install # pre install to save time spinning up new ec2 instances
}

main
