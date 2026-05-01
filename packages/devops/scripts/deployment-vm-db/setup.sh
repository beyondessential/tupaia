#!/bin/bash -ex

HOME_DIR=/home/ubuntu
POSTGRES_VERSION="${POSTGRES_VERSION:-17}"
POSTGRES_CONFIG_DIR="/etc/postgresql/${POSTGRES_VERSION}/main"

SCRIPT_DIR=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )
cd "$SCRIPT_DIR"

# install postgres
if ! dpkg -s "postgresql-${POSTGRES_VERSION}" &> /dev/null
then
  sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
  wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -
  sudo apt-get update
  sudo apt-get -y install "postgresql-${POSTGRES_VERSION}"

  sudo apt-get -y install postgis "postgresql-${POSTGRES_VERSION}-postgis-3"
else
  echo "postgresql ${POSTGRES_VERSION} already installed, skipping"
fi

# Allow remote connection
sudo -u postgres sed -i "$ a\listen_addresses = '*'" "${POSTGRES_CONFIG_DIR}/postgresql.conf"
sudo -u postgres sed -i "$ a\host all all 0.0.0.0/0 md5" "${POSTGRES_CONFIG_DIR}/pg_hba.conf"
sudo -u postgres sed -i "$ a\host all all ::/0 md5" "${POSTGRES_CONFIG_DIR}/pg_hba.conf"

# Increase max connections
sudo -u postgres sed -i "s/max_connections = 100/max_connections = 500/g" "${POSTGRES_CONFIG_DIR}/postgresql.conf"

# start postgres
sudo service postgresql restart

echo "Db Server set up successfully"