#!/usr/bin/env bash
set -e

internal_deps=(
  access-policy
  admin-panel
  aggregator
  api-client
  auth
  constants
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
  sync
  tsmodels
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
  # 'foo,bar,baz' → '{foo,bar,baz}'
  echo "{$pattern}"
else
  echo "${internal_deps[@]}"
fi
