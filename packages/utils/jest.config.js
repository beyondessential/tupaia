module.exports = {
  transform: { '^.+\\.jsx?$': './scripts/JestTransformer.js' },
  testMatch: ['<rootDir>/src/tests/*.test.js?(x)'],
  // testMatch: ['<rootDir>/src/tests/AsyncTaskQueue.test.js'],
  transformIgnorePatterns: ['/node_modules/'],
  testEnvironment: 'node',
  testURL: 'http://localhost',
};
