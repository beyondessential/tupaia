#!/bin/bash
PATH_TO_PACKAGE=$1
PARAMETER_STORE_PATH_PREFIX=$2

while read PARAMETER; do
    IFS== read PARAMETER_NAME PARAMETER_VALUE <<<$PARAMETER
    PARAMETER_VALUE="${PARAMETER_VALUE%\"}" # Remove leading quote
    PARAMETER_VALUE="${PARAMETER_VALUE#\"}" # Remove trailing quote
    PARAMETER_QUALIFIED_NAME="$PARAMETER_STORE_PATH_PREFIX/$PARAMETER_NAME"
    echo "Saving $PARAMETER_NAME as $PARAMETER_QUALIFIED_NAME"
    CLI_INPUT_JSON="{\"Name\":\"${PARAMETER_QUALIFIED_NAME}\",\"Value\":\"${PARAMETER_VALUE}\",\"Type\":\"SecureString\",\"KeyId\":\"alias/meditrak-server-encryption-key\",\"Overwrite\":true}"
    CLI_COMMAND="aws ssm put-parameter --cli-input-json '$CLI_INPUT_JSON'"
    eval $CLI_COMMAND
done <${PATH_TO_PACKAGE}/.env
