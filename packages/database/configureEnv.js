/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

const path = require('path');
const dotenv = require('dotenv');

dotenv.config({
  path: [
    path.resolve(__dirname, '../../env/.env.db'),
    path.resolve(__dirname, '../../env/.env.pg'),
    path.resolve(__dirname, '.env'),
  ],
});
