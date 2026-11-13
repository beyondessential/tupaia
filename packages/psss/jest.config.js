const baseConfig = require('../../jest.config-js.json');

module.exports = async () => ({
  ...baseConfig,
  rootDir: '.',
  moduleNameMapper: {
    // @tupaia/ui-components is source-only (no build step), so resolve it to its TypeScript
    // source, which the ts-jest transform below compiles
    '^@tupaia/ui-components$': '<rootDir>/../ui-components/src/index.ts',
  },
  transform: {
    ...baseConfig.transform,
    '^.+\\.tsx?$': [
      'ts-jest',
      // psss itself is plain JS with no tsconfig; these options are only used to compile the
      // ui-components sources pulled in via moduleNameMapper, so skip type diagnostics
      {
        tsconfig: { jsx: 'react', allowJs: true, esModuleInterop: true, module: 'commonjs' },
        diagnostics: false,
      },
    ],
  },
  /**
   * Since 1.0.0, Axios switched from emitting a CommonJS module to ECMAScript, which causes errors
   * with Jest. This is a workaround.
   * @see https://github.com/axios/axios/issues/5026
   */
  transformIgnorePatterns: ['node_modules/(?!axios)'],
});
