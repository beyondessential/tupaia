#!/bin/bash -le

# Possibly: aws configure to set region for cli

# install node and yarn
curl -sL https://deb.nodesource.com/setup_12.x -o nodesource_setup.sh
bash nodesource_setup.sh
rm nodesource_setup.sh
apt-get install nodejs <<< "Y"
npm install --global yarn

# install nginx and add h5bp config
apt-get install nginx <<< "Y"
git clone https://github.com/h5bp/server-configs-nginx.git
cp -R ./server-configs-nginx/h5bp/ /etc/nginx/
rm -rf server-configs-nginx

# install pm2
npm i --global pm2
pm2 install pm2-logrotate

# do the rest of the operations as the ubuntu user, so everything is available correctly
su - ubuntu

# install lastpass
sudo apt-get --no-install-recommends -yqq install \
  bash-completion \
  build-essential \
  cmake \
  libcurl4  \
  libcurl4-openssl-dev  \
  libssl-dev  \
  libxml2 \
  libxml2-dev  \
  libssl1.1 \
  pkg-config \
  ca-certificates \
  xclip <<< "Y"

git clone https://github.com/lastpass/lastpass-cli.git
cd lastpass-cli
make
sudo make install
cd ../
rm -rf lastpass-cli
mkdir -p /home/ubuntu/.local/share/lpass

# clone our repo
cd /home/ubuntu
git clone https://github.com/beyondessential/tupaia.git

# run yarn install to cache most dependencies
cd /home/ubuntu/tupaia
SKIP_BUILD_INTERNAL_DEPENDENCIES=true yarn install
