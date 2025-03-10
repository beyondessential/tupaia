/**
 * https://babeljs.io/docs/en/config-files#jest
 *
 * Setup jest in Monorepo. This is to create a custom jest transformer file that wraps babel-jest.
 *
 * @type {Transformer}
 */
// eslint-disable-next-line import/no-extraneous-dependencies
module.exports = require('babel-jest').default.createTransformer({
  rootMode: 'upward',
});
