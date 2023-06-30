#!/bin/bash -le

# This script is used by Amazon Image Builder to pre-bake a Tupaia AMI
# To deploy changes, upload the latest to the S3 bucket "tupaia_devops"

# install nginx and add h5bp config
if ! command -v nginx &> /dev/null
then
  sudo apt-get install -yqq nginx
  git clone https://github.com/h5bp/server-configs-nginx.git
  cd ./server-configs-nginx
  git checkout tags/2.0.0
  cd ..
  sudo cp -R ./server-configs-nginx/h5bp/ /etc/nginx/
  rm -rf server-configs-nginx
else
  echo "nginx already installed, skipping"
fi

# install psql for use when installing mv refresh in the db
sudo apt-get install -yqq postgresql-client

# install lastpass
if ! command -v lpass &> /dev/null
then
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
  sudo rm -rf lastpass-cli
  mkdir -p /home/ubuntu/.local/share/lpass
else
  echo "lastpass already installed, skipping"
fi

# install puppeteer dependencies https://pptr.dev/15.3.0/troubleshooting#chrome-headless-doesnt-launch-on-unix
sudo apt-get -yqq install \
  ca-certificates \
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


# install node and yarn
if ! command -v node &> /dev/null
then
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
  export NVM_DIR="$HOME/.nvm"
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
  nvm install 14.15.4
  npm install --global yarn
else
  echo "nvm already installed, skipping"
fi

# install pm2
if ! command -v node &> /dev/null
then
  npm install --global pm2
  pm2 install pm2-logrotate
else
  echo "pm2 already installed, skipping"
fi

HOME_DIR=/home/ubuntu
LOGS_DIR=$HOME_DIR/logs
# Create a directory for logs to go
mkdir -m 777 -p $LOGS_DIR

cd tupaia
yarn install # pre install to save time spinning up new ec2 instances