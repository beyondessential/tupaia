#!/bin/bash

DIR=$(dirname "$0")
package_json_path=$1

# if no package.json entrypoint is specified, just return all internal dependencies
if [ -z ${package_json_path} ]; then
  echo "access-policy" "aggregator" "auth" "database" "data-api" "data-broker" "dhis-api" "expression-parser"  "indicators" "utils" "ui-components" "weather-api" "server-boilerplate"
  exit 0
fi

# we are getting internal dependencies for a specific package.json
# recursively build up an array of all internal dependencies this package depends on
internal_dependencies=$(grep -o '@tupaia/[^"]*": "[0-9\.]*"' "${DIR}/${package_json_path}" | cut -d / -f 2 | cut -d \" -f 1)
echo $internal_dependencies
exit 0

