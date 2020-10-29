#!/bin/bash

# Stores every parameter in the .env file of --package-name on parameter store based on --environment
# --package-name      The name of the package to store the .env variables of
# --environment       The subpath to store the parameters under in parameter store, e.g. dev
# --upload/--download Whether to save the .env state to parameter store, or download the parameters
#                     from the store into the .env (defaults to upload)

# Get current directory
DIR=$(dirname "$0")

# Set defaults
DIRECTION="upload"

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
    --upload)
        DIRECTION="upload"
        shift # past argument
        shift # past value
        ;;
    --download)
        DIRECTION="download"
        shift # past argument
        shift # past value
        ;;
    esac
done
set -- "${POSITIONAL[@]}" # restore positional parameters

if [[ -z $PACKAGE_NAME || -z $ENVIRONMENT ]]; then
    echo "Please specify both --package-name and --environment (and optionally, --path-to-package, --upload, or --download)"
    exit 0
fi
PARAMETER_STORE_PATH_PREFIX="${PACKAGE_NAME}/${ENVIRONMENT}"

if [[ -z $PATH_TO_PACKAGE ]]; then
    # Use default path to package, based on ubuntu server setup
    PATH_TO_PACKAGE="/home/ubuntu/tupaia/packages/${PACKAGE_NAME}"
fi

if [[ $DIRECTION == "upload" ]]; then
    ${DIR}/storeDotEnvOnParameterStore.sh ${PATH_TO_PACKAGE} ${PARAMETER_STORE_PATH_PREFIX}
else
    ${DIR}/fetchDotEnvFromParameterStore.sh ${PATH_TO_PACKAGE} ${PARAMETER_STORE_PATH_PREFIX}
fi
