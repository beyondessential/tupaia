/* eslint-env node */
module.exports = {
  extends: '../../.eslintrc-js.json',
  overrides: [
    {
      files: 'src/migrations/**',
      rules: {
        'func-names': 'off',
        'no-underscore-dangle': 'off',
        'no-unused-vars': 'off',
        'no-var': 'off',
        strict: 'off',
      },
    },
  ],
  "ignorePatterns": [
    "dist/",
    "node_modules/",
    "scripts/",
    ".eslintrc.js"
  ]
};
