/* eslint-env node */
module.exports = {
  // Don't extend standard eslint-js because we use mocha not jest
  extends: '@beyondessential/js',
  parser: '@babel/eslint-parser',
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
