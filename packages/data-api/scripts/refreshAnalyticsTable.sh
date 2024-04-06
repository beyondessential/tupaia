#!/usr/bin/env bash
set -e

if [[ $1 = '--full' || $1 = '-f' ]]; then
  ./scripts/fullRefreshAnalyticsTable.sh
else
  ./scripts/fastRefreshAnalyticsTable.sh
fi
