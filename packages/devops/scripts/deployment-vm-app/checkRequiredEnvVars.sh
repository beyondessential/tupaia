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
if [[ ! -v LASTPASS_EMAIL ]]; then
    echo "LASTPASS_EMAIL must be set"
    exit 1
fi
if [[ ! -v LASTPASS_PASSWORD ]]; then
    echo "LASTPASS_PASSWORD must be set"
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