import '@babel/polyfill';
import http from 'http';
import nodeSchedule from 'node-schedule';

import {
  AnalyticsRefresher,
  EntityHierarchyCacher,
  getDbMigrator,
  ModelRegistry,
  SurveyResponseOutdater,
  TaskAssigneeEmailer,
  TaskCompletionHandler,
  TaskCreationHandler,
  TaskUpdateHandler,
  buildEntityParentChildRelationIfEmpty,
  TupaiaDatabase,
  SyncLookupEntityRefresher,
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
import { startSyncWithMs1 } from './ms1';
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

  // Add listener to handle entity parent child relation changes
  // const syncLookupEntityRefresher = new SyncLookupEntityRefresher(models);
  // syncLookupEntityRefresher.listenForChanges();

  /**
   * Scheduled tasks
   */
  new TaskOverdueChecker(models).init();
  new RepeatingTaskDueDateHandler(models).init();

  /**
   * Set up actual app with routes etc.
   */
  const app = createApp(database, models);

  /**
   * Start the server
   */
  const port = process.env.PORT || 8090;
  http.createServer(app).listen(port);
  winston.info(`Running on port ${port}`);
  winston.info(`Logging at ${winston.level} level`);
  winston.debug(`Time zone is ${Intl.DateTimeFormat().resolvedOptions().timeZone}`);
  const aggregationDescription = process.env.AGGREGATION_URL_PREFIX || 'production';
  winston.info(`Connected to ${aggregationDescription} aggregation`);

  /**
   * Regularly sync data to the aggregation servers
   */
  startSyncWithDhis(models);

  /**
   * Regularly sync data to MS1
   */
  startSyncWithMs1(models);

  /**
   * Regularly sync data from KoBoToolbox
   */
  startSyncWithKoBo(models);

  /**
   * Regularly sync actions that have happened on server with the app social feed.
   */
  startFeedScraper(models);

  /**
   * If running via PM2, run migrations then notify that we are ready
   */
  if (process.send) {
    try {
      await database.waitForChangeChannel();
      winston.info('Successfully connected to pubsub service');
      const dbMigrator = getDbMigrator();
      await dbMigrator.up();
      winston.info('Database migrations complete');

      await buildEntityParentChildRelationIfEmpty(models);
    
      if (isFeatureEnabled('MEDITRAK_SYNC_QUEUE')) {
        winston.info('Creating permissions based meditrak sync queue');
        // don't await this as it's not critical, and will hold up the process if it fails
        createPermissionsBasedMeditrakSyncQueue(database);
      }
    } catch (error) {
      winston.error(error.message);
    }
  }

  /**
   * Gracefully handle shutdown of ScheduledTasks
   */
  process.on('SIGINT', function () {
    nodeSchedule.gracefulShutdown().then(() => process.exit(0));
  });
})();
