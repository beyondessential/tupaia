#!/bin/bash
for PACKAGE in "meditrak-server" "admin-panel" "web-frontend" "web-config-server" "devops" "database"; do
  jet encrypt ./packages/${PACKAGE}/.env ./packages/${PACKAGE}/ci-env-vars.encrypted
done
