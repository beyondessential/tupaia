require('ts-node').register({
  transpileOnly: true, // tsconfig.json is resolved relative to the package tests are running in
});

module.exports = {
  exit: true,
  spec: './src/tests/**/*.test.js',
  timeout: 100000,
};
