#!/bin/bash -ex

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
if [[ ! -v BITWARDEN_EMAIL ]]; then
    echo "BITWARDEN_EMAIL must be set"
    exit 1
fi
if [[ ! -v BITWARDEN_PASSWORD ]]; then
    echo "BITWARDEN_PASSWORD must be set"
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