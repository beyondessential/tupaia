#!/bin/bash
for PACKAGE in "database" "dhis-api" "utils"; do
  echo Testing ${PACKAGE}
  yarn workspace @tupaia/${PACKAGE} test
done
