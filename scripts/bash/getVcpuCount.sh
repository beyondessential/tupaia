#!/usr/bin/env bash

if [[ $(uname) = Darwin ]]; then
  sysctl -n hw.ncpu
else
  nproc
fi
