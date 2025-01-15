import baseConfig from '../../jest.config-ts.json';

module.exports = {
  ...baseConfig,
  moduleDirectories: ['node_modules'],
  collectCoverageFrom: ['**/src/components/**/*.js'],
  // handle static assets @see https://jestjs.io/docs/webpack#handling-static-assets
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga|css)$':
      '<rootDir>/jestFileMock.js',
    '^file-loader': '<rootDir>/jestFileMock.js',
  },
  transformIgnorePatterns: ['/node_modules/'],
  testTimeout: 30 * 1000, // 30 seconds. Needed for CI as some test take a while if CPU has high load
};
