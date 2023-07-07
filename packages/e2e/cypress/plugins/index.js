/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

const cypressDotenv = require('cypress-dotenv');
const webpackPreprocessor = require('@cypress/webpack-preprocessor');
const path = require('path');
const fs = require('fs');

module.exports = (on, config) => {
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config
  on('task', {
    /**
     * Required by `@cypress/snapshot` - `useRelativeSnapshots` config
     *
     * @see https://www.npmjs.com/package/@cypress/snapshot
     */
    readFileMaybe(filename) {
      return fs.existsSync(filename) ? fs.readFileSync(filename, 'utf8') : null;
    },
  });

  const options = webpackPreprocessor.defaultOptions;

  options.webpackOptions.resolve = {
    alias: {
      fs: path.resolve(__dirname, 'moduleMock.js'),
      yargs: path.resolve(__dirname, 'moduleMock.js'),
      child_process: path.resolve(__dirname, 'moduleMock.js'),
    },
  };

  options.webpackOptions.module.rules.push({
    test: /\.(js|jsx)$/,
    loader: require.resolve('babel-loader'),
    options: {
      presets: ['@babel/preset-env'],
    },
  });

  on('file:preprocessor', webpackPreprocessor(options));

  return cypressDotenv(config);
};
