#!/bin/bash -le

INSTANCE_IDENTIFIER=$1
DIR=$(dirname "$0")

source $DIR/../../.env

echo "Setting RDS master password for ${INSTANCE_IDENTIFIER}"
aws rds modify-db-instance --db-instance-identifier $INSTANCE_IDENTIFIER --master-user-password $DB_PG_PASSWORD
