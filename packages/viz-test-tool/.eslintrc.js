/* eslint-env node */
module.exports = {
  extends: '../../.eslintrc-ts.json',
  // Standard config needed for correct scoping of eslint
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ['./tsconfig.json'],
  },
  root: true,
};
