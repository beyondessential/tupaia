/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

const baseConfig = require('../../jest.config-js.json');

module.exports = async () => ({
  ...baseConfig,
  rootDir: '.',
  setupFilesAfterEnv: ['../../jest.setup.js', './jest.setup.js'],
});
