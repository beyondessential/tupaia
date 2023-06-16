/* eslint-env node */
module.exports = {
  extends: '../../.eslintrc-js-frontend.json',
  plugins: ['module-resolver'],
  rules: {
    'import/no-absolute-path': 'off',
    'module-resolver/use-alias': 'warn',
  },
  settings: {
    'import/resolver': {
      'babel-module': {},
    },
  },
};
