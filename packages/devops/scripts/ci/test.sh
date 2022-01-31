#!/bin/bash

DIR=$(dirname "$0")

${DIR}/setupTestDatabase.sh

yarn test