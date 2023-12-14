/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

const baseConfig = {
  "error_file"  : null,
  "out_file"    : null,
  "wait_ready"  : false, // don't wait for one process to finish starting before starting next
}

/**
 * Convenience fn
 */
const startDevConfig = (packageName) => ({
  "name"        : packageName,
  "script"      : `yarn workspace @tupaia/${packageName} start-dev`,
  ...baseConfig,
});

/**
 * Convenience fn
 */
const startDevConfigs = (packageNames) =>
  packageNames.map(packageName => startDevConfig(packageName));

module.exports = {
  baseConfig: baseConfig,
  startDevConfig,
  startDevConfigs,
}