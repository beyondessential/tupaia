/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

const isTest = process.env.NODE_ENV === 'test';

const presets = [];
if (isTest) {
  presets.push('@babel/preset-env'); // Required for code coverage collection
}
presets.push('@babel/preset-typescript');

module.exports = {
  presets,
};
