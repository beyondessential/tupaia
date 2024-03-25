/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

const path = require('path');
const dotenv = require('dotenv');

() => {
  dotenv.config({
    path: [
      path.resolve(__dirname, '../../../env/.env.aggregation'),
      path.resolve(__dirname, '../../../env/.env.dhis'),
      path.resolve(__dirname, '../../../env/.env.dataLake'),
      path.resolve(__dirname, '../../../env/.env.superset'),
      path.resolve(__dirname, '../../../env/.env.servers'),
      path.resolve(__dirname, '../../../env/.env.db'),
      '.env',
    ],
  });
};
