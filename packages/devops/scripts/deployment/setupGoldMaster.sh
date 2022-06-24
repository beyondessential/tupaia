#!/bin/bash -le

# This script is used by Amazon Image Builder to pre-bake a Tupaia AMI
# To deploy changes, upload the latest to the S3 bucket "tupaia_devops"

# install nginx and add h5bp config
sudo apt-get install -yqq nginx
git clone https://github.com/h5bp/server-configs-nginx.git
cd ./server-configs-nginx
git checkout tags/2.0.0
cd ..
sudo cp -R ./server-configs-nginx/h5bp/ /etc/nginx/
rm -rf server-configs-nginx

# install psql for use when installing mv refresh in the db
sudo apt-get install -yqq postgresql-client

# install node and yarn
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
nvm install 14
npm install --global yarn

# install pm2
npm install --global pm2
pm2 install pm2-logrotate

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
  xclip

git clone https://github.com/lastpass/lastpass-cli.git
cd lastpass-cli
sudo make
sudo make install
cd ../
rm -rf lastpass-cli
mkdir -p /home/ubuntu/.local/share/lpass

# clone our repo
cd /home/ubuntu
sudo -Hu ubuntu git clone https://github.com/beyondessential/tupaia.git

# build all packages once using dev to speed up future branch-specific builds
sudo -Hu ubuntu /home/ubuntu/tupaia/packages/devops/scripts/deployment/buildDeployablePackages.sh gold-master-image-builder
