#!/bin/bash -le

PARAMETER_NAME=$1
echo $(aws ssm get-parameter --with-decryption --name $PARAMETER_NAME | grep Value | cut -d'"' -f4)
