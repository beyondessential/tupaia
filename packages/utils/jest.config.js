const baseConfig = require('../../jest.config-js.json');

module.exports = async () => ({
  ...baseConfig,
  rootDir: '.',
  globalSetup: '<rootDir>/jest-setup.js',
});
