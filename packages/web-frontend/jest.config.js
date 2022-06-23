const baseConfig = require('../../jest.config-js.json');

module.exports = {
  ...baseConfig,
  rootDir: '.',
  setupFiles: ['<rootDir>/config/polyfills.js'],
  testMatch: ['<rootDir>/src/**/__tests__/**/*.js?(x)', '<rootDir>/src/**/?(*.)(spec|test).js?(x)'],
  testURL: 'http://localhost',
  transform: {
    ...baseConfig.transform,
    '^.+\\.css$': '<rootDir>/config/jest/cssTransform.js',
    '^(?!.*\\.(js|jsx|css|json)$)': '<rootDir>/config/jest/fileTransform.js',
  },
  transformIgnorePatterns: [`/node_modules/(?!(@?react-leaflet))`],
  moduleNameMapper: {
    '^react-native$': 'react-native-web',
    '^@tupaia/ui-components$': '<rootDir>/jestFileMock.js', // FIXME: is this right?
  },
};
