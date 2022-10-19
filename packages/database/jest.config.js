const baseConfig = require('../../jest.config-js.json');

const { coveragePathIgnorePatterns = [] } = baseConfig;

module.exports = async () => ({
  ...baseConfig,
  rootDir: '.',
  coveragePathIgnorePatterns: [...coveragePathIgnorePatterns, '<rootDir>/src/migrations'],
  setupFilesAfterEnv: ['../../jest.setup.js', './jest.setup.js'],
});
