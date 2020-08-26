/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

module.exports = {
  stories: ['../stories/**/*.stories.js'],
  "addons": [
    "@storybook/addon-essentials",  
  ],
  webpackFinal: (config) => {
    // Add svg loading to storybook (https://stackoverflow.com/a/61706308)

    const fileLoaderRule = config.module.rules.find(rule => rule.test && rule.test.test('.svg'));
    fileLoaderRule.exclude = /\.svg$/;

    const rule = { // Copied from config/webpack.config.dev.js
      test: [/\.svg$/],
      use: [
        {
          loader: require.resolve('babel-loader'),
        },
        {
          loader: require.resolve('react-svg-loader'),
        },
      ],
    };

    config.module.rules.push(rule);
    return config;
  },
};

