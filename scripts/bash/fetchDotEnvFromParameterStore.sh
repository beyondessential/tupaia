#!/bin/bash
PATH_TO_PACKAGE=$1
PARAMETER_STORE_PATH_PREFIX=$2

rm ${PATH_TO_PACKAGE}/.env
echo "Checking out environment variables under the prefix ${PARAMETER_STORE_PATH_PREFIX}"
$(aws ssm get-parameters-by-path --with-decryption --path $PARAMETER_STORE_PATH_PREFIX |
    jq -r '.Parameters| .[] | .Name + "=\"" + .Value + "\""  ' |
    sed -e "s~${PARAMETER_STORE_PATH_PREFIX}/~~" >${PATH_TO_PACKAGE}/.env)
