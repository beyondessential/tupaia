module.exports = {
  transform: { '^.+\\.jsx?$': './scripts/JestTransformer.js' },
  // testMatch: ['<rootDir>/src/tests/*.test.js?(x)'],
  testMatch: ['<rootDir>/src/tests/WorkBookParser.teststub.js'],
  transformIgnorePatterns: ['/node_modules/'],
  testEnvironment: 'node',
  testURL: 'http://localhost',
};
