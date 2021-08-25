#!/bin/bash
set -x

DEPLOYMENT_URL=$1
echo $DEPLOYMENT_URL
curl --output /dev/null --silent --head --fail $DEPLOYMENT_URL
