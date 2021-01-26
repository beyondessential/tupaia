#!/bin/bash
rm -f .env
for PACKAGE in "meditrak-server" "admin-panel" "web-frontend" "web-config-server" "devops" "database"; do
    cat ./packages/${PACKAGE}/.env >>.env
done
jet encrypt .env ci-env-vars.encrypted
