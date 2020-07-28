#!/bin/bash

# Exit when any command fails
set -e

USAGE="Usage: refreshDb dump_path [-m --migrate]"
migrate=false
db_dump_path=$1

if [ "$db_dump_path" == "" ]; then
  echo "No dump path specified"
  echo $USAGE
  exit 1
fi

while [ "$2" != "" ]; do
  case $2 in
      -m | --migrate )
        shift
        migrate=true
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
psql tupaia -c 'ALTER USER "tupaia" WITH SUPERUSER'
psql tupaia -c 'CREATE EXTENSION postgis'
psql tupaia -U tupaia < $db_dump_path
psql tupaia -c 'ALTER USER "tupaia" WITH NOSUPERUSER'

if [ $migrate = true ]; then
  yarn migrate;
fi
