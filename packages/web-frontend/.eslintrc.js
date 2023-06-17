/* eslint-env node */
module.exports = {
  extends: '../../.eslintrc-js-frontend.json',
  rules: {
    camelcase: 'warn',
    'import/no-named-as-default': 'off',
    'no-debugger': 'warn',
    'import/no-cycle': 'warn',
    'jsx-a11y/click-events-have-key-events': 'warn',
    'jsx-a11y/no-noninteractive-element-interactions': 'warn',
    'jsx-a11y/no-static-element-interactions': 'warn',
    'no-dupe-keys': 'warn',
    'no-param-reassign': 'warn',
    'no-restricted-properties': 'warn',
    'no-shadow': 'warn',
    'no-unsafe-finally': 'warn',
    'no-useless-catch': 'warn',
    'no-unused-vars': 'warn',
    'react/button-has-type': 'warn',
    'react/default-props-match-prop-types': 'warn',
    'react/no-unused-prop-types': 'warn',
    'react/no-array-index-key': 'warn',
    'react/forbid-prop-types': 'warn',
    'react/prop-types': 'warn',
    'react/prefer-stateless-function': 'warn',
    'react/require-default-props': 'warn',
    'react/state-in-constructor': 'warn',
    'react/static-property-placement': 'warn',
    'prefer-destructuring': 'warn',
    'prettier/prettier': 'warn',
  },
  ignorePatterns: [
    '.vscode/',
    'node_modules/',
    'public/',
    'scripts/',
    '.eslintrc.js'
  ],
  overrides: [
    {
      files: ['src/tests/**/*.js'],
      env: {
        mocha: true
      },
      rules: {
        'import/no-extraneous-dependencies': [
          'error',
          {
            devDependencies: true // allow importing from devDependencies for tests
          }
        ],
        'no-undef': 0 // 'expect' global
      }
    }
  ]
};
