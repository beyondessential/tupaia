const baseConfig = require('../../jest.config-js.json');

module.exports = async () => ({
  ...baseConfig,
  rootDir: '.',
  transform: {
    '^.+\\.jsx?$': ['ts-jest', { isolatedModules: true, tsconfig: '<rootDir>/tsconfig.json' }],
  },
  setupFilesAfterEnv: ['../../jest.setup.js', './jest.setup.js'],
});
