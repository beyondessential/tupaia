#!/bin/bash -e

curenv=$(declare -p -x)
test -f .env && source .env
eval "$curenv"