#!/usr/bin/env bash
# EC2 Image Builder runs this script to pre-bake the Tupaia AMIs, one per architecture (x86_64 and
# arm64). The pipelines are defined in the `tupaia` Pulumi stack in beyondessential/ops.
#
# DEPLOYING CHANGES
#   1. Merge changes into the default branch.
#   2. Optionally, go to EC2 Image Builder → Image pipelines → tupaia-gold-master-x86_64 and
#      tupaia-gold-master-arm64 and run both. Left alone, this will happen automatically according
#      to the pipelines’ build schedule. Do this step if you need changes to take effect immediately.
#
# REMARK
#   The pipelines always run the version of this script from the default branch, regardless of
#   whether you’ll be deploying from a feature branch. It must work on both architectures.

set -e

HOME_DIR=/home/ubuntu
TUPAIA_DIR=$HOME_DIR/tupaia

install_nginx() {
  if ! command -v nginx &>/dev/null; then
    echo 'nginx not installed. Installing...'
    sudo apt-get install -yqq nginx

    # add h5bp config
    git clone --branch 2.0.0 --depth 1 https://github.com/h5bp/server-configs-nginx.git
    sudo cp -R ./server-configs-nginx/h5bp/ /etc/nginx/
    rm -rf server-configs-nginx

    # Add the nginx user (www-data) to the ubuntu group to give it access to the tupaia code
    sudo usermod -a -G ubuntu www-data
  fi
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

install_bestool() {
  if ! command -v bestool &>/dev/null; then
    echo 'bestool not installed. Installing...'
    sudo install -D -m 0644 "$TUPAIA_DIR"/packages/devops/keyrings/bes-tools.gpg /etc/apt/keyrings/bes-tools.gpg
    echo 'deb [arch=amd64,arm64 signed-by=/etc/apt/keyrings/bes-tools.gpg] https://tools.ops.tamanu.io/apt stable main' |
      sudo tee /etc/apt/sources.list.d/bes-tools.list
    sudo apt-get update
    sudo apt-get -yqq install bestool
  fi

  # Same auto-update as the Tamanu servers
  printf '#!/bin/sh\napt-get install -y bestool\n' | sudo tee /etc/cron.daily/apt-upgrade-bestool >/dev/null
  sudo chmod 0755 /etc/cron.daily/apt-upgrade-bestool

  # Only deployments carrying a Canopy registration run alertd; startupTupaia.sh
  # turns it on for those (see setupObservability.sh)
  sudo systemctl disable --now bestool-alertd.service 2>/dev/null || true

  echo "bestool $(bestool --version) is installed"
}

install_munin() {
  sudo apt-get -yqq install munin munin-node libwww-perl

  # Served over the tailnet only (see setupObservability.sh), never by munin-node itself
  sudo sed -i -E 's/^\s*host\s.*/host 127.0.0.1/' /etc/munin/munin-node.conf

  # nginx_request and nginx_status read nginx's stub_status from loopback
  sudo tee /etc/nginx/conf.d/munin-status.conf >/dev/null <<'NGINX'
server {
  listen 127.0.0.1:8099;
  location = /nginx_status {
    stub_status;
    allow 127.0.0.1;
    deny all;
  }
}
NGINX
  sudo tee /etc/munin/plugin-conf.d/nginx >/dev/null <<'MUNIN'
[nginx*]
env.url http://127.0.0.1:8099/nginx_status
MUNIN
  for plugin in nginx_request nginx_status; do
    sudo ln -sf /usr/share/munin/plugins/$plugin /etc/munin/plugins/$plugin
  done
  if [[ -e /usr/share/munin/plugins/bestool_alertd ]]; then
    sudo ln -sf /usr/share/munin/plugins/bestool_alertd /etc/munin/plugins/bestool_alertd
  fi

  sudo systemctl enable munin-node
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
    npm install --global pm2@^7.0.4
  elif (($(pm2 --version | cut -d . -f 1) != 7)); then
    echo "PM2 $(pm2 --version) is installed. Replacing with ^7.0.4..."
    npm install --global pm2@^7.0.4
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
  install_bestool
  install_munin
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
