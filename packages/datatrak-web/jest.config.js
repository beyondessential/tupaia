const baseConfig = require('../../jest.config-js.json');

module.exports = async () => ({
  ...baseConfig,
  testMatch: ['<rootDir>/src/__tests__/**/**.test.ts?(x)'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
    '^.+\\.(js|jsx)$': '../../jestTransformer.js',
  },
  moduleNameMapper: {
    '^axios$': require.resolve('axios'),
    '\\.css$': '<rootDir>/jest.cssMock.js',
  },
  transformIgnorePatterns: ['/node_modules/(?!(msw|react-ios-pwa-prompt)/).*/'],
  setupFiles: ['./jest.setup.js'],
});
