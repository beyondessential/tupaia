#!/bin/bash -e
DIR=$(dirname "$0")
${DIR}/copyInEnvironmentVariables.sh
for PACKAGE in $(${DIR}/../../../../scripts/bash/getInternalDependencies.sh); do
    # skip the following packages - they get tested separately as they require db access
    if [[ "$PACKAGE" == "database" || "$PACKAGE" == "data-api" || "$PACKAGE" == "auth" || "$PACKAGE" == "indicators" || "$PACKAGE" == "server-boilerplate" ]]; then
        continue
    fi
    echo Testing ${PACKAGE}
    yarn workspace @tupaia/${PACKAGE} test
done
