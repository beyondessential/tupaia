#!/bin/bash
RETRIES=50

args=(
    --host "$CI_TEST_DB_URL"
    --username "postgres"
    --dbname "postgres"
    --quiet --no-align --tuples-only
)

until select="$(echo 'SELECT PostGIS_full_version()' | psql "${args[@]}")" && [[ "$select" == *"2.5."* ]] || [ $RETRIES -eq 0 ]; do
    echo "Waiting for postgres server, $((RETRIES--)) remaining attempts..."
    echo $select
    sleep 1
done
