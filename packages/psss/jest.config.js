const baseConfig = require('../../jest.config-js.json');

module.exports = async () => ({
  ...baseConfig,
  rootDir: '.',
  /**
   * Since 1.0.0, Axios switched from emitting a CommonJS module to ECMAScript, which causes errors
   * with Jest. This is a workaround.
   * @see https://github.com/axios/axios/issues/5026
   */
  transformIgnorePatterns: ['node_modules/(?!axios)'],
});
