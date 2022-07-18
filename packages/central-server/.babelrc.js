/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

const isTest = process.env.NODE_ENV === 'test';

module.exports = {
  plugins: isTest ? ['istanbul'] : [],
  ignore: isTest ? [] : ['**src/database/migrations', 'src/tests/**'],
};