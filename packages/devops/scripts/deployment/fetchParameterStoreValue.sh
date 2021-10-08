#!/bin/bash -le

PARAMETER_NAME=$1
echo $(aws ssm get-parameter --with-decryption --name LASTPASS_EMAIL | grep Value | cut -d'"' -f4)
