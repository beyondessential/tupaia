/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

const path = require('path');
const dotenv = require('dotenv');

() => {
  dotenv.config({
    path: [
      path.resolve(__dirname, '../../../env/aggregation.env'),
      path.resolve(__dirname, '../../../env/dhis.env'),
      path.resolve(__dirname, '../../../env/data-lake.env'),
      path.resolve(__dirname, '../../../env/superset.env'),
      path.resolve(__dirname, '../../../env/servers.db'),
      path.resolve(__dirname, '../../../env/db.env'),
      '.env',
    ],
  });
};
