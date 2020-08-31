#!/bin/bash

# Stores every parameter in the .env file of --package-name on parameter store based on --environment
# --package-name     The name of the package to store the .env variables of
# --environment      The subpath to store the parameters under in parameter store, e.g. dev

# Getting command line arguments, taken from https://stackoverflow.com/questions/192249/how-do-i-parse-command-line-arguments-in-bash
POSITIONAL=()
while [[ $# -gt 0 ]]; do
  key="$1"

  case $key in
      --package-name)
      PACKAGE_NAME="$2"
      shift # past argument
      shift # past value
      ;;
      --environment)
      ENVIRONMENT="$2"
      shift # past argument
      shift # past value
      ;;
      --path-to-package)
      PATH_TO_PACKAGE="$2"
      shift # past argument
      shift # past value
      ;;
  esac
done
set -- "${POSITIONAL[@]}" # restore positional parameters

if [[ -z $PACKAGE_NAME || -z $ENVIRONMENT ]]; then
  echo "Please specify both --package-name and --environment (and optionally, --path-to-package)"
  exit 0
fi

if [[ -z $PATH_TO_PACKAGE ]]; then
  # Use default path to package, based on ubuntu server setup
  PATH_TO_PACKAGE="/home/ubuntu/tupaia/packages/${PACKAGE_NAME}"
fi

cd $PATH_TO_PACKAGE
while read PARAMETER; do
  IFS== read PARAMETER_NAME PARAMETER_VALUE <<< $PARAMETER
  PARAMETER_VALUE="${PARAMETER_VALUE%\"}" # Remove leading quote
  PARAMETER_VALUE="${PARAMETER_VALUE#\"}" # Remove trailing quote
  PARAMETER_QUALIFIED_NAME="/$PACKAGE_NAME/$ENVIRONMENT/$PARAMETER_NAME"
  echo "Saving $PARAMETER_NAME as $PARAMETER_QUALIFIED_NAME"
  CLI_INPUT_JSON="{\"Name\":\"${PARAMETER_QUALIFIED_NAME}\",\"Value\":\"${PARAMETER_VALUE}\",\"Type\":\"SecureString\",\"KeyId\":\"alias/meditrak-server-encryption-key\",\"Overwrite\":true}"
  CLI_COMMAND="aws ssm put-parameter --cli-input-json '$CLI_INPUT_JSON'"
  eval $CLI_COMMAND
done <.env
