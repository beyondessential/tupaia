#!/bin/bash -ex

HOME_DIR=/home/ubuntu

SCRIPT_DIR=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )
cd "$SCRIPT_DIR"

# install postgres 13
if ! command -v postgres &> /dev/null
then
  sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
  wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -
  sudo apt-get update
  sudo apt-get -y install postgresql-13

  sudo apt-get -y install postgis postgresql-13-postgis-3
else
  echo "postgresql already installed, skipping"
fi

# Allow remote connection
sudo -u postgres sed -i "$ a\listen_addresses = '*'" /etc/postgresql/13/main/postgresql.conf
sudo -u postgres sed -i "$ a\host all all 0.0.0.0/0 md5" /etc/postgresql/13/main/pg_hba.conf
sudo -u postgres sed -i "$ a\host all all ::/0 md5" /etc/postgresql/13/main/pg_hba.conf

# Increase max connections
sudo -u postgres sed -i "s/max_connections = 100/max_connections = 500/g" /etc/postgresql/13/main/postgresql.conf

# start postgres
sudo service postgresql restart

echo "Db Server set up successfully"