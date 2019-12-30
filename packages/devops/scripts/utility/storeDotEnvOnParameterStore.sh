#!/bin/bash

# Stores every parameter in the .env file of --repository-name on parameter store based on --environment
# --repository-name     The name of the respository to store the .env variables of
# --environment         The subpath to store the parameters under in parameter store, e.g. dev

# Getting command line arguments, taken from https://stackoverflow.com/questions/192249/how-do-i-parse-command-line-arguments-in-bash
POSITIONAL=()
while [[ $# -gt 0 ]]; do
  key="$1"

  case $key in
      --repository-name)
      REPOSITORY_NAME="$2"
      shift # past argument
      shift # past value
      ;;
      --environment)
      ENVIRONMENT="$2"
      shift # past argument
      shift # past value
      ;;
      --path-to-repository)
      PATH_TO_REPOSITORY="$2"
      shift # past argument
      shift # past value
      ;;
  esac
done
set -- "${POSITIONAL[@]}" # restore positional parameters

if [[ -z $REPOSITORY_NAME || -z $ENVIRONMENT ]]; then
  echo "Please specify both --repository-name and --environment (and optionally, --path-to-repository)"
  exit 0
fi

if [[ -z $PATH_TO_REPOSITORY ]]; then
  # Use default path to repository, based on ubuntu server setup
  PATH_TO_REPOSITORY="/home/ubuntu/${REPOSITORY_NAME}"
fi

cd $PATH_TO_REPOSITORY
while read PARAMETER; do
  IFS== read PARAMETER_NAME PARAMETER_VALUE <<< $PARAMETER
  PARAMETER_VALUE="${PARAMETER_VALUE%\"}" # Remove leading quote
  PARAMETER_VALUE="${PARAMETER_VALUE#\"}" # Remove trailing quote
  PARAMETER_QUALIFIED_NAME="/$REPOSITORY_NAME/$ENVIRONMENT/$PARAMETER_NAME"
  echo "Saving $PARAMETER_NAME as $PARAMETER_QUALIFIED_NAME"
  CLI_INPUT_JSON="{\"Name\":\"${PARAMETER_QUALIFIED_NAME}\",\"Value\":\"${PARAMETER_VALUE}\",\"Type\":\"SecureString\",\"KeyId\":\"alias/meditrak-server-encryption-key\",\"Overwrite\":true}"
  CLI_COMMAND="aws ssm put-parameter --cli-input-json '$CLI_INPUT_JSON'"
  eval $CLI_COMMAND
done <.env
