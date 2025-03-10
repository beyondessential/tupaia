import baseConfig from '../../jest.config-ts.json';

module.exports = async () => ({
  ...baseConfig,
  rootDir: '.',
});
