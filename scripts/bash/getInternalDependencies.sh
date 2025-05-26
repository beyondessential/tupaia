#!/usr/bin/env bash
set -e

dir=$(dirname "$0")
flag=$1 # Optional --as-glob flag

internal_deps=(
  access-policy
  admin-panel
  aggregator
  api-client
  auth
  data-api
  data-broker
  data-lake-api
  database
  dhis-api
  expression-parser
  indicators
  kobo-api
  server-boilerplate
  server-utils
  superset-api
  tsutils
  types
  ui-chart-components
  ui-components
  ui-map-components
  utils
  weather-api
)

if [[ $1 = --as-glob ]]; then
  # ('foo' 'bar' 'baz') → 'foo,bar,baz'
  pattern=$(
    IFS=,
    echo "${internal_deps[*]}"
  )
  # 'foo,bar,baz' → '@tupaia/{foo,bar,baz}'
  echo "@tupaia/{$pattern}"
else
  echo "${internal_deps[@]}"
fi
