#!/bin/bash
DIR=`dirname "$0"`
yarn workspace @tupaia/${CI_PACKAGE} test
