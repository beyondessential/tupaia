/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import * as dotenv from 'dotenv';
import path from 'path';
import { getDbMigrator } from './getDbMigrator';

dotenv.config({
  path: [
    path.resolve(__dirname, '../../.env.db'),
    path.resolve(__dirname, '../../.env.pg'),
    path.resolve(__dirname, '.env'),
  ],
}); // Load the environment variables into process.env

const migrator = getDbMigrator(true);
migrator.run();
