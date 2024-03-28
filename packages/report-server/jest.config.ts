/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import baseConfig from '../../jest.config-ts.json';

module.exports = async () => ({
  ...baseConfig,
  rootDir: '.',
  setupFilesAfterEnv: ['../../jest.setup.js', './jest.setup.ts'],
});
