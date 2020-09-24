/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
const path = require('path');

module.exports = {
  mode: 'production',
  entry: {
    Icons: './src/components/Icons',
    Inputs: './src/components/Inputs',
    Layout: './src/components/Layout',
    Table: './src/components/Table',
    UserMessage: './src/components/UserMessage',
    ActionsMenu: './src/components/ActionsMenu.js',
    Alert: './src/components/Alert.js',
    BarMeter: './src/components/BarMeter.js',
    Breadcrumbs: './src/components/Breadcrumbs.js',
    Button: './src/components/Button.js',
    Card: './src/components/Card.js',
    CardTabs: './src/components/CardTabs.js',
    CircleMeter: './src/components/CircleMeter.js',
    Dialog: './src/components/Dialog.js',
    HomeButton: './src/components/HomeButton.js',
    IconButton: './src/components/IconButton.js',
    LoadingContainer: './src/components/LoadingContainer.js',
    NavBar: './src/components/NavBar.js',
    PasswordStrengthBar: './src/components/PasswordStrengthBar.js',
    ProfileButton: './src/components/ProfileButton.js',
    Tabs: './src/components/Tabs.js',
    Toast: './src/components/Toast.js',
    Tooltip: './src/components/Tooltip.js',
  },
  output: {
    filename: '[name].js',
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
