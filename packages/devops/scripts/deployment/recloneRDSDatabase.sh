#!/bin/bash -le

INSTANCE_IDENTIFIER=$1

echo "Setting RDS master password for ${INSTANCE_IDENTIFIER}"
TAGS=$(aws rds list-tags-for-resource --resource-name $INSTANCE_IDENTIFIER)