/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
const path = require('path');
const glob = require('glob');

module.exports = {
  mode: 'production',
  /**
   * The "[name]" placeholder in the "output" property will be replaced
   * with each key name in our "entry" object.
   */
  entry: glob.sync('./src/components/**/*.js').reduce((entryConfig, match) => {
    const fileName = match.split('/').pop();

    if (fileName === 'index.js') {
      return entryConfig;
    }

    const entryName = fileName.replace('.js', '');

    return {
      ...entryConfig,
      [entryName]: match,
    };
  }, {}),
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'lib'),
    library: '@tupaia/ui-components',
    libraryTarget: 'umd',
  },
  externals: [
    {
      react: {
        root: 'React',
        commonjs2: 'react',
        commonjs: ['react'],
        amd: 'react',
      },
      'styled-components': 'styled-components',
      'react-router-dom': 'react-router-dom',
      'react-router': 'react-router',
    },
    /@material-ui\/core\/.*/,
  ],
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
        },
      },
    ],
  },
};
