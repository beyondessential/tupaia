#!/bin/bash -e
set -x

echo "Copying full tupaia setup to common volume"
mv /tupaia/* /tupaia_common/
