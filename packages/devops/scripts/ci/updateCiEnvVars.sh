#!/bin/bash

rm -f .env
rm -f old.env
echo "Decryting old ci-env-vars"
jet decrypt ci-env-vars.encrypted old.env
echo "Creating new ci-env-vars"
for PACKAGE in "meditrak-server" "admin-panel" "web-frontend" "web-config-server" "devops" "data-api" "database"; do
    cat ./packages/${PACKAGE}/.env >>.env
    echo "" >>.env
done
echo "Encrypting new ci-env-vars"
jet encrypt .env ci-env-vars.encrypted

echo "Diff between new .env and old .env"
diff --color=always --suppress-common-lines <(source old.env; set) <(source .env; set) | grep -v '> _=.env' | grep -v '< _=old.env'
rm -f old.env

exit 0