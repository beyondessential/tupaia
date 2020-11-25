/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

// Metro Bundler Configuration
// https://facebook.github.io/metro/docs/en/configuration

const path = require('path');

module.exports = {
  // Add additional Yarn workspace package roots to the module map
  watchFolders: [
    path.resolve(__dirname, '../..', 'node_modules'),
    path.resolve(__dirname, '..', 'access-policy'),
    path.resolve(__dirname, '..', 'expression-parser'),
    path.resolve(__dirname, '..', 'utils'),
  ],
};
