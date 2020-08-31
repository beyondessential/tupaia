#!/bin/bash
PACKAGE=$1
yarn --cwd ./packages/${PACKAGE} validate
