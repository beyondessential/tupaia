#!/bin/bash -e
DIR=$(dirname "$0")
for PACKAGE in $(${DIR}/../../../../scripts/bash/getInternalDependencies.sh); do
    # skip the following packages - they get tested separately as they require db access
    if [[ "$PACKAGE" == "admin-panel" || "$PACKAGE" == "database" || "$PACKAGE" == "data-api" || "$PACKAGE" == "data-lake-api" || "$PACKAGE" == "auth" || "$PACKAGE" == "indicators" || "$PACKAGE" == "server-boilerplate" ]]; then
        continue
    fi
    echo Testing ${PACKAGE}
    yarn workspace @tupaia/${PACKAGE} test
done
