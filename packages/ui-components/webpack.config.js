/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
const path = require('path');

module.exports = {
  entry: './src/index.js',
  mode: 'production',
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist'),
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
    /@material-ui\/lab\/.*/,
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
