const baseConfig = require('../../jest.config-ts.json');

module.exports = async () => ({
  ...baseConfig,
  rootDir: '.',
  globalSetup: '<rootDir>/jest-setup.js',
});
