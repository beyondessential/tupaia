#!/usr/bin/env bash

if [[ $(uname) = Darwin ]]; then
  sysctl -n hw.activecpu
else
  nproc
fi
