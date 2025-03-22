#!/bin/bash -e

DIR=$(dirname "$0")
if [ "$1" != "" ]; then
  # pop the package_path off, and interpret the rest as dependencies that have been checked earlier
  # in the recursion
  package_path=$1
  shift
fi

dependencies_already_visited=($@)

# if no package.json entrypoint is specified, just return all internal dependencies
if [ -z ${package_path} ]; then
  echo "types" "utils" "tsutils" "ui-components" "ui-chart-components" "ui-map-components" "server-utils" "access-policy" "admin-panel" "aggregator" "api-client" "auth" "database" "data-api" "dhis-api" "data-lake-api" "expression-parser" "indicators" "weather-api" "kobo-api" "superset-api" "data-broker" "server-boilerplate" "sync"
  exit 0
fi

# we are getting internal dependencies for a specific package.json
internal_dependencies=($(sed -n '/"dependencies": {/,/}/p' ${PWD}/${package_path}/package.json | grep -o '@tupaia/[^"]*": "[0-9\.]*"' | cut -d / -f 2 | cut -d \" -f 1))
if [ ${#internal_dependencies[@]} -eq 0 ]; then
  exit 0 # no internal dependencies of this package, early return
fi

# remove any dependencies already recursed this dependency earlier in the tree
for dependency in "${dependencies_already_visited[@]}"; do
  for i in "${!internal_dependencies[@]}"; do
    if [[ ${internal_dependencies[i]} = $dependency ]]; then
      unset 'internal_dependencies[i]'
    fi
  done
done
for i in "${!internal_dependencies[@]}"; do
    array_without_gaps+=( "${internal_dependencies[i]}" )
done
internal_dependencies=("${array_without_gaps[@]}")
unset array_without_gaps

# recursively build up an array of all internal dependencies this package depends on
for dependency in ${internal_dependencies[@]}; do

  nested_dependencies=($(${DIR}/getInternalDependencies.sh "${package_path}/../${dependency}" ${dependencies_already_visited[@]} ${internal_dependencies[@]} ))
  if [ ${#nested_dependencies[@]} -eq 0 ]; then
    continue
  fi

  # add nested deps to internal dependencies
  internal_dependencies=("${internal_dependencies[@]}" "${nested_dependencies[@]}")
done

# remove any duplicates
deduplicated_union=()
for i in "${!internal_dependencies[@]}"; do
  for j in "${!internal_dependencies[@]}"; do
    if [[ i -ne j ]] && [[ ${internal_dependencies[i]} = ${internal_dependencies[j]} ]]; then
      unset 'internal_dependencies[i]'
    fi
  done
done
for i in "${!internal_dependencies[@]}"; do
    array_without_gaps+=( "${internal_dependencies[i]}" )
done
internal_dependencies=("${array_without_gaps[@]}")
unset array_without_gaps

# echo out result for calling script to pick up
echo ${internal_dependencies[@]}
exit 0

