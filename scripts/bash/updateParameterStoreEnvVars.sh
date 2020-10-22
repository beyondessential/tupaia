#!/bin/bash
DIR=$(dirname "$0")
for PACKAGE in "meditrak-server" "admin-panel" "web-frontend" "web-config-server"; do
    echo "Storing .env contents on parameter store for ${ENVIRONMENT} ${PACKAGE}"
    ${DIR}/storeDotEnvOnParameterStore.sh --package-name ${PACKAGE} --environment ${ENVIRONMENT}
done
