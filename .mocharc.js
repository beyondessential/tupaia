require('@babel/register')({
  configFile: '../../babel.config.json', // relative to the package tests are running on
});

module.exports = {
  exit: true,
  require: ['@babel/polyfill'],
  spec: './src/tests/**/*.test.js',
  timeout: 100000,
};
