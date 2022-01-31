#!/bin/bash

DIR=$(dirname "$0")

${DIR}/setupTestDatabasez.sh

yarn test