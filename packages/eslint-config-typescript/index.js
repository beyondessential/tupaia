module.exports = {
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:jest/recommended',
    'plugin:prettier/recommended',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'jest'],
  root: true,
  rules: {
    '@typescript-eslint/explicit-function-return-type': 'off',
    'jest/expect-expect': ['warn', { assertFunctionNames: ['expect', 'assert*'] }],
  },
};
