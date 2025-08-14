// Exact copy of: @tupaia/central-server/src/createMeditrakSyncView.js
// TODO: Tidy this up as part of RN-502

import winston from 'winston';
import { TupaiaDatabase } from '@tupaia/database';
import { configureWinston } from '@tupaia/server-boilerplate';
import { isFeatureEnabled } from '@tupaia/utils';
import { configureEnv } from '../configureEnv';
import { createPermissionsBasedMeditrakSyncQueue } from './createPermissionsBasedMeditrakSyncQueue';

configureWinston();
configureEnv();

(async () => {
  if (!isFeatureEnabled('SERVER_CHANGE_ENQUEUER')) {
    throw new Error(
      'Feature SERVER_CHANGE_ENQUEUER is disabled, cannot build permissions based view',
    );
  }

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
