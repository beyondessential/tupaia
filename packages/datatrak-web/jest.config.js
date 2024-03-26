/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

const baseConfig = require('../../jest.config-js.json');

module.exports = async () => ({
  ...baseConfig,
  testMatch: ['<rootDir>/src/__tests__/**/**.test.ts?(x)'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  moduleNameMapper: {
    '^axios$': require.resolve('axios'),
  },
  transformIgnorePatterns: ['/node_modules/(?!(msw)/).*/'],
});
