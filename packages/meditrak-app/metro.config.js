const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('node:path');

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  // Workaround for https://github.com/facebook/metro/issues/1
  // Should be fixed in the next release of react-native (as at 2023-09-26)
  watchFolders: [
    path.resolve(__dirname, '..', '..', 'node_modules'),
    path.resolve(__dirname, '..', 'access-policy'),
    path.resolve(__dirname, '..', 'constants'),
    path.resolve(__dirname, '..', 'expression-parser'),
  ],
  resolver: {
    unstable_enableSymlinks: true,
  },
  // Workaround end
  resetCache: true,
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
