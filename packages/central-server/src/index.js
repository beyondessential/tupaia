import '@babel/polyfill';
import http from 'http';
import nodeSchedule from 'node-schedule';

import {
  AnalyticsRefresher,
  buildAncestorDescendantRelationIfEmpty,
  EntityHierarchyCacher,
  runServerMigrations,
  ModelRegistry,
  SurveyResponseOutdater,
  TaskAssigneeEmailer,
  TaskCompletionHandler,
  TaskCreationHandler,
  TaskUpdateHandler,
  TupaiaDatabase,
} from '@tupaia/database';
import { configureWinston } from '@tupaia/server-boilerplate';
import { isFeatureEnabled } from '@tupaia/utils';
import { configureEnv } from './configureEnv';
import { createApp } from './createApp';
import { createPermissionsBasedMeditrakSyncQueue, MeditrakSyncQueue } from './database';
import * as modelClasses from './database/models';
import { startSyncWithDhis } from './dhis';
import { startSyncWithKoBo } from './kobo';
import winston from './log';
import { RepeatingTaskDueDateHandler, TaskOverdueChecker } from './scheduledTasks';
import { startFeedScraper } from './social';

configureWinston();
configureEnv();

(async () => {
  /**
   * Set up database
   */
  const database = new TupaiaDatabase();
  const models = new ModelRegistry(database, modelClasses, true);

  /**
   * Start the HTTP server first so the port is open (and auth works) while the
   * migrations and closure-cache rebuild below run — otherwise a boot that has
   * to rebuild ancestor_descendant_relation from scratch leaves the whole site
   * unreachable for minutes. Writes are gated (503) via `serverReady` until the
   * change-listeners are wired up below, so mutations can't slip through before
   * their handlers exist; auth and reads are served immediately.
   */
  let serverReady = false;
  const app = createApp(database, models, () => serverReady);
  const port = process.env.PORT || 8090;
  http.createServer(app).listen(port);
  winston.info(`Running on port ${port}`);
  winston.info(`Logging at ${winston.level} level`);
  winston.debug(`Time zone is ${Intl.DateTimeFormat().resolvedOptions().timeZone}`);
  const aggregationDescription = process.env.AGGREGATION_URL_PREFIX || 'production';
  winston.info(`Connected to ${aggregationDescription} aggregation`);

  /**
   * Run migrations before wiring up the change-listeners below. The
   * entity-hierarchy migration truncates and rewrites
   * ancestor_descendant_relation; if EntityHierarchyCacher is listening first
   * it rebuilds that table concurrently and deadlocks the migration on boot.
   */
  try {
    if (process.send) {
      await database.waitForChangeChannel();
      winston.info('Successfully connected to pubsub service');
      // Holds a migration advisory lock for the duration so sync-server defers its
      // lookup-table work while the schema is changing (see isMigrationInProgress).
      await runServerMigrations(database);
      winston.info('Database migrations complete');

      await buildAncestorDescendantRelationIfEmpty(models);

      if (isFeatureEnabled('MEDITRAK_SYNC_QUEUE')) {
        winston.info('Creating permissions based meditrak sync queue');
        // don't await this as it's not critical, and will hold up the process if it fails
        createPermissionsBasedMeditrakSyncQueue(database);
      }
    } else {
      await buildAncestorDescendantRelationIfEmpty(models);
    }
  } catch (error) {
    winston.error(error.message);
  }

  /**
   * Set up change handlers e.g. for syncing
   */
  if (isFeatureEnabled('MEDITRAK_SYNC_QUEUE')) {
    const meditrakSyncQueue = new MeditrakSyncQueue(models);
    meditrakSyncQueue.listenForChanges();
  }

  // Pre-cache entity hierarchy details
  const entityHierarchyCacher = new EntityHierarchyCacher(models);
  entityHierarchyCacher.listenForChanges();

  // Add listener to refresh analytics table
  const analyticsRefresher = new AnalyticsRefresher(models);
  analyticsRefresher.listenForChanges();

  // Add listener to handle survey response changes
  const surveyResponseOutdater = new SurveyResponseOutdater(models);
  surveyResponseOutdater.listenForChanges();

  // Add listener to handle survey response changes for tasks
  const taskCompletionHandler = new TaskCompletionHandler(models);
  taskCompletionHandler.listenForChanges();

  // Add listener to handle creating tasks when submitting survey responses
  const taskCreationHandler = new TaskCreationHandler(models);
  taskCreationHandler.listenForChanges();

  // Add listener to handle assignee changes for tasks
  const taskAssigneeEmailer = new TaskAssigneeEmailer(models);
  taskAssigneeEmailer.listenForChanges();

  // Add listener to handle survey response entity changes for tasks
  const taskUpdateHandler = new TaskUpdateHandler(models);
  taskUpdateHandler.listenForChanges();

  // All change-listeners are registered — writes are now safe to accept.
  serverReady = true;
  winston.info('Change-listeners registered; now accepting writes');

  /**
   * Scheduled tasks
   */
  new TaskOverdueChecker(models).init();
  new RepeatingTaskDueDateHandler(models).init();

  /**
   * Regularly sync data to the aggregation servers
   */
  startSyncWithDhis(models);

  /**
   * Regularly sync data from KoBoToolbox
   */
  startSyncWithKoBo(models);

  /**
   * Regularly sync actions that have happened on server with the app social feed.
   */
  startFeedScraper(models);

  /**
   * Gracefully handle shutdown of ScheduledTasks
   */
  process.on('SIGINT', function () {
    nodeSchedule.gracefulShutdown().then(() => process.exit(0));
  });
})();
