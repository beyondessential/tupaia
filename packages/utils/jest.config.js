module.exports = {
  transform: { '^.+\\.jsx?$': './scripts/JestTransformer.js' },
  // testMatch: ['<rootDir>/src/tests/*.test.js?(x)'],
  testMatch: ['<rootDir>/src/__tests__/**/**.test.js'],
  transformIgnorePatterns: ['/node_modules/'],
  testEnvironment: 'node',
  setupFilesAfterEnv: ['../../jestScaffolding.js'],
};
