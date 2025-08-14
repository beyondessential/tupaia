import baseConfig from '../../jest.config-ts.json';

module.exports = async () => ({
  ...baseConfig,
  rootDir: '.',
  setupFilesAfterEnv: ['../../jest.setup.js', './jest.setup.ts'],
});
