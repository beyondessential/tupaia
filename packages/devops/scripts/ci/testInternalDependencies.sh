#!/bin/bash
DIR=$(dirname "$0")
for PACKAGE in $(${DIR}/../../../../scripts/bash/getInternalDependencies.sh); do
    # skip the following packages - they get tested separately as they require db access
    if [[ "$PACKAGE" == "database" || "$PACKAGE" == "data-api" || "$PACKAGE" == "auth" || "$PACKAGE" == "indicators" || "$PACKAGE" == "server-boilerplate" ]]; then
        continue
    fi
    echo Testing ${PACKAGE}
    if ! yarn workspace @tupaia/${PACKAGE} test; then
        exit 1 # the tests for this internal depencency failed
    fi
done
