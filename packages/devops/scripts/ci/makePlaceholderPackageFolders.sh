#!/bin/bash
DIR=$(dirname "$0")
DEPLOYABLE_PACKAGES=$(${DIR}/../../../../scripts/bash/getDeployablePackages.sh)
INTERNAL_DEPENDENCIES=$(${DIR}/../../../../scripts/bash/getInternalDependencies.sh)

for PACKAGE in $DEPLOYABLE_PACKAGES; do
    mkdir -p ${DIR}/../../../${PACKAGE}
done

for PACKAGE in $INTERNAL_DEPENDENCIES; do
    mkdir -p ${DIR}/../../../${PACKAGE}
done
