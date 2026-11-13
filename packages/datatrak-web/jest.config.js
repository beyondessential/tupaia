const baseConfig = require('../../jest.config-js.json');

module.exports = async () => ({
  ...baseConfig,
  testMatch: ['<rootDir>/src/__tests__/**/**.test.ts?(x)'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
    // Uses the root babel config (rootMode upward), needed to compile the plain-JS ESM sources
    // of the @tupaia/ui-* packages, which are source-only (no build step)
    '^.+\\.(js|jsx)$': '../../jestTransformer.js',
  },
  moduleNameMapper: {
    '^axios$': require.resolve('axios'),
    // The ui component packages are source-only (no build step), so resolve them to their
    // TypeScript sources, which the transforms above compile
    '^@tupaia/ui-components$': '<rootDir>/../ui-components/src/index.ts',
    '^@tupaia/ui-map-components$': '<rootDir>/../ui-map-components/src/index.ts',
  },
  transformIgnorePatterns: ['/node_modules/(?!(msw)/).*/'],
  setupFiles: ['./jest.setup.js'],
});
