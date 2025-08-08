#!/usr/bin/env bash
set -ex

if [[ ! -v DOMAIN ]]; then
    echo "DOMAIN must be set"
    exit 1
fi
if [[ ! -v DEFAULT_FRONTEND ]]; then
    echo "DEFAULT_FRONTEND must be set"
    exit 1
fi
if [[ ! -v USE_SSL ]]; then
    echo "USE_SSL must be set"
    exit 1
fi
if [[ ! -v BW_CLIENTID ]]; then
    echo "BW_CLIENTID must be set"
    exit 1
fi
if [[ ! -v BW_CLIENTSECRET ]]; then
    echo "BW_CLIENTSECRET must be set"
    exit 1
fi
if [[ ! -v BW_PASSWORD ]]; then
    echo "BW_PASSWORD must be set"
    exit 1
fi
if [[ ! -v GIT_REPO ]]; then
    echo "GIT_REPO must be set"
    exit 1
fi
if [[ ! -v GIT_BRANCH ]]; then
    echo "GIT_BRANCH must be set"
    exit 1
fi
if [[ ! -v DEPLOYMENT_NAME ]]; then
    echo "DEPLOYMENT_NAME must be set"
    exit 1
fi
