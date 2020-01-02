#!/bin/bash

if [[ $CI_BRANCH == "master" ]];then
   export DEPLOYMENT_URL="tupaia.org"
else
   export DEPLOYMENT_URL="${CI_BRANCH}.tupaia.org"
fi
