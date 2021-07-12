#!/bin/bash

DIR=$(dirname "$0")
package_path=$1

# pop the package_path off, and interpret the rest as dependencies that have been checked earlier
# in the recursion
shift
dependencies_already_visited=($@)

# if no package.json entrypoint is specified, just return all internal dependencies
if [ -z ${package_path} ]; then
  echo "access-policy" "aggregator" "auth" "database" "data-api" "data-broker" "dhis-api" "expression-parser"  "indicators" "utils" "ui-components" "weather-api" "server-boilerplate"
  exit 0
fi

# we are getting internal dependencies for a specific package.json
internal_dependencies=($(grep -o '@tupaia/[^"]*": "[0-9\.]*"' "${PWD}/${package_path}/package.json" | cut -d / -f 2 | cut -d \" -f 1))
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

