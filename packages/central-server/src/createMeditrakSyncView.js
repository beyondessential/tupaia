// Exact copy of: @tupaia/meditrak-app-server/src/sync/createMeditrakSyncView.ts
// TODO: Tidy this up as part of RN-502

import '@babel/polyfill';

import { TupaiaDatabase } from '@tupaia/database';
import { isFeatureEnabled } from '@tupaia/utils';

import winston from './log';
import { createPermissionsBasedMeditrakSyncQueue } from './database';
import { configureEnv } from './configureEnv';

configureEnv();

(async () => {
  /**
   * Set up database
   */

  const database = new TupaiaDatabase();

  if (!isFeatureEnabled('MEDITRAK_SYNC_QUEUE')) {
    throw new Error('Feature MEDITRAK_SYNC_QUEUE is disabled, cannot build permissions based view');
  }

  await database.waitForChangeChannel();
  const start = Date.now();
  await createPermissionsBasedMeditrakSyncQueue(database);
  const end = Date.now();
  winston.info(`Created permissions_based_meditrak_sync_queue, took: ${end - start}ms`);
  await database.closeConnections();
})();
