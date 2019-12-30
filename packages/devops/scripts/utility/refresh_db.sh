#!/bin/bash

# Exit when any command fails
set -e

MIGRATE=false
USAGE="usage: refresh_db dumpPath [-m --migrate]"
DB_DUMP_PATH=$1

if [ "$DB_DUMP_PATH" == "" ]; then
  echo "No dump path specified"
  echo $USAGE
  exit 1
fi

while [ "$2" != "" ]; do
  case $2 in
      -m | --migrate )
        shift
        MIGRATE=true
        ;;
      -h | --help )
        echo "Will drop your local tupaia database, and reinstate it from a dump"
        echo $USAGE;
        exit
        ;;
      * )
        echo $USAGE
        exit 1
  esac
done

psql postgres -c 'DROP DATABASE "tupaia"'
psql postgres -c 'CREATE DATABASE "tupaia" WITH OWNER "tupaia"'
psql tupaia -c 'CREATE EXTENSION postgis'
psql tupaia -U tupaia < $DB_DUMP_PATH

if [ $MIGRATE = true ]; then
  yarn migrate;
fi
