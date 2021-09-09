#!/bin/bash

# Set default branch as current branch
COMPARE_BRANCH=""

# Getting command line arguments, taken from https://stackoverflow.com/questions/192249/how-do-i-parse-command-line-arguments-in-bash
POSITIONAL=()
while [[ $# -gt 0 ]]; do
    key="$1"

    case $key in
    --compare)
        COMPARE_BRANCH="$2"
        shift # past argument
        shift # past value
        ;;
    esac
done
set -- "${POSITIONAL[@]}" # restore positional parameters

rm -f .env
rm -f old.env
echo "Checking out previous ci-env-vars"
git reset -q HEAD ci-env-vars.encrypted
git checkout $COMPARE_BRANCH -- ci-env-vars.encrypted
git reset -q HEAD ci-env-vars.encrypted
echo "Decrypting old ci-env-vars"
jet decrypt ci-env-vars.encrypted old.env
echo "Creating new ci-env-vars"
for PACKAGE in "meditrak-server" "admin-panel" "web-frontend" "web-config-server" "devops" "data-api" "database"; do
    cat ./packages/${PACKAGE}/.env >>.env
    echo "" >>.env
done
echo "Encrypting new ci-env-vars"
jet encrypt .env ci-env-vars.encrypted

echo -e "Diff between \e[32mnew\e[0m and \e[31mold\e[0m ci-env-vars"
diff --color=always --suppress-common-lines <(source old.env; set) <(source .env; set) | grep -v '> _=.env' | grep -v '< _=old.env'
rm -f old.env

exit 0