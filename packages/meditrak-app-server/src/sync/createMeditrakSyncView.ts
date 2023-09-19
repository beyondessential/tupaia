/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import * as dotenv from 'dotenv';

import winston from 'winston';
import { TupaiaDatabase } from '@tupaia/database';
import { configureWinston } from '@tupaia/server-boilerplate';
import { createPermissionsBasedMeditrakSyncQueue } from './createPermissionsBasedMeditrakSyncQueue';

configureWinston();
dotenv.config(); // Load the environment variables into process.env

(async () => {
  /**
   * Set up database
   */
  const database = new TupaiaDatabase();

  await database.waitForChangeChannel();
  const start = Date.now();
  await createPermissionsBasedMeditrakSyncQueue(database);
  const end = Date.now();
  winston.info(`Created permissions_based_meditrak_sync_queue, took: ${end - start}ms`);
  await database.closeConnections();
})();
