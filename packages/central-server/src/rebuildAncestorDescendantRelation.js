/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import '@babel/polyfill';

import {} from 'dotenv/config'; // Load the environment variables into process.env
import { TupaiaDatabase } from '@tupaia/database';

import winston from './log';

(async () => {
  const database = new TupaiaDatabase();

  await database.connection.raw(
    `update entity set name = concat('|', name) where type = 'project';`,
  );
  await database.connection.raw(
    `update entity set name = substring(name, 2) where type = 'project';`,
  );

  winston.info(`Cache rebuilt`);
  await database.closeConnections();
})();
