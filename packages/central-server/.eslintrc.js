/* eslint-env node */
module.exports = {
  // Don't extend standard eslint-js because we use mocha not jest
  extends: '@beyondessential/js',
  // No Babel in this package. ESLint 7’s default parser can’t parse class fields
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'import/no-extraneous-dependencies': 'error',
  },
  overrides: [
    {
      files: ['src/tests/**/*.js'],
      env: {
        mocha: true,
      },
      rules: {
        'import/no-extraneous-dependencies': [
          'error',
          {
            devDependencies: true, // allow importing from devDependencies for tests
          },
        ],
        'no-unused-expressions': 'off', // not chai friendly
      },
    },
  ],
  ignorePatterns: ['dist/', 'node_modules/', '.eslintrc.js'],
};
