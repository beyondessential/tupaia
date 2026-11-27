const baseConfig = require('../../jest.config-node-js.json');

module.exports = async () => ({
  ...baseConfig,
  rootDir: '.',
  setupFilesAfterEnv: ['../../jest.setup.js', './jest.setup.js'],
});
