const baseConfig = require('../../jest.config-node-js.json');

module.exports = async () => ({
  ...baseConfig,
  rootDir: '.',
});
