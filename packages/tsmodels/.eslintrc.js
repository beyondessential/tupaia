/* eslint-env node */
module.exports = {
  extends: "../../.eslintrc-ts.json",
  // Standard config needed for correct scoping of eslint
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ['./tsconfig.json'],
  },
  root: true,
  // Extra ignores
  "ignorePatterns": [
    "dist/",
    "node_modules/",
    ".eslintrc.js",
    "src/types/models.ts", // generated
    "src/schemas/schemas.ts", // generated
  ]
};
