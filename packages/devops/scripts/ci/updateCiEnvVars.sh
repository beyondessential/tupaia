#!/bin/bash
rm -f .env
for PACKAGE in "meditrak-server" "admin-panel" "web-frontend" "web-config-server" "devops" "data-api" "database"; do
    cat ./packages/${PACKAGE}/.env >>.env
    echo "" >>.env
done
jet encrypt .env ci-env-vars.encrypted
