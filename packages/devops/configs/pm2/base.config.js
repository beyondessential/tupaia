const baseConfig = {
  "error_file"  : null,
  "out_file"    : null,
  "wait_ready"  : false, // don't wait for one process to finish starting before starting next
}

/**
 * Convenience fn
 * @param {string} packageNames
 */
const startDevConfig = (packageName) => ({
  "name"        : packageName,
  "script"      : `yarn workspace @tupaia/${packageName} start-dev`,
  ...baseConfig,
});

/**
 * Convenience fn
 * @param {string[]} packageNames
 */
const startDevConfigs = (packageNames) =>
  packageNames.map(packageName => startDevConfig(packageName));

module.exports = {
  baseConfig: baseConfig,
  startDevConfig,
  startDevConfigs,
}