import baseConfig from '../../jest.config-ts.json';

module.exports = {
  ...baseConfig,
  moduleDirectories: ['node_modules'],
  collectCoverageFrom: ['**/src/components/**/*.js'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
    // Needed to compile the plain-JS ESM sources of @tupaia/ui-components, which is
    // source-only (no build step) and resolved via its src entry point
    '^.+\\.jsx?$': '../../jestTransformer.js',
  },
  // handle static assets @see https://jestjs.io/docs/webpack#handling-static-assets
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga|css)$':
      '<rootDir>/jestFileMock.js',
    '^file-loader': '<rootDir>/jestFileMock.js',
  },
  transformIgnorePatterns: ['/node_modules/'],
  testTimeout: 30 * 1000, // 30 seconds. Needed for CI as some test take a while if CPU has high load
};
