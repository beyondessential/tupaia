/* eslint-env node */
module.exports = {
  extends: ['@beyondessential/js', 'plugin:cypress/recommended'],
  parser: '@babel/eslint-parser',
  rules: {
    'cypress/no-force': 'error',
    'no-unused-expressions': 'off',
  },
  ignorePatterns: ['dist/', 'node_modules/', '.eslintrc.js'],
  env: {
    browser: true,
    'cypress/globals': true,
  },
};
