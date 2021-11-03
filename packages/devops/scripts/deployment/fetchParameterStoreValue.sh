#!/bin/bash -le

PARAMETER_NAME=$1
echo $(aws ssm get-parameter --region ap-southeast-2 --with-decryption --name $PARAMETER_NAME | grep Value | cut -d'"' -f4)
