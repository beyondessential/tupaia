const baseConfig = require('../../jest.config-ts.json');

module.exports = async () => ({
  ...baseConfig,
  rootDir: '.',
  setupFilesAfterEnv: ['../../jest.setup.js'],
});
