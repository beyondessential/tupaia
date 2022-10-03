const baseConfig = require('../../jest.config-js.json');

module.exports = async () => ({
  ...baseConfig,
  rootDir: '.',
  moduleNameMapper: {
    '^/aggregator(.*)$': '<rootDir>/src/aggregator$1',
    '^/*apiV1(.*)$': '<rootDir>/src/apiV1$1',
    '^/app(.*)$': '<rootDir>/src/app$1',
    '^/appServer(.*)$': '<rootDir>/src/appServer$1',
    '^/authSession(.*)$': '<rootDir>/src/authSession$1',
    '^/connections(.*)$': '<rootDir>/src/connections$1',
    '^/dhis(.*)$': '<rootDir>/src/dhis$1',
    '^/export(.*)$': '<rootDir>/src/export$1',
    '^/models(.*)$': '<rootDir>/src/models$1',
    '^/preaggregation(.*)$': '<rootDir>/src/preaggregation$1',
    '^/utils(.*)$': '<rootDir>/src/utils$1',
  },
  setupFilesAfterEnv: ['../../jest.setup.js', './jest.setup.js'],
});
