/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 **/

import {} from 'dotenv/config'; // Load the environment variables into process.env

import http from 'http';

import { TupaiaDatabase, SyncQueue as GenericSyncQueue, TYPES, ModelRegistry } from './database';
import { startSyncWithDhis } from './dhis';
import { startSyncWithMs1 } from './ms1';
import { startFeedScraper } from './social';
import { createApp } from './app';
import { initialiseNotifiers } from './notifications/notifiers';

import winston from './log';

/**
 * Set up database
 */
const database = new TupaiaDatabase();
const models = new ModelRegistry(database);

/**
 * Set up change handlers e.g. for syncing
 */
const MODELS_TO_SYNC_WITH_MEDITRAK = [
  models.facility,
  models.permissionGroup,
  models.country,
  models.geographicalArea,
  models.question,
  models.survey,
  models.surveyGroup,
  models.surveyScreen,
  models.surveyScreenComponent,
  models.option,
  models.optionSet,
  models.entity,
];

const meditrakSyncQueue = new GenericSyncQueue( // Syncs changes to the data collection app
  models,
  models.meditrakSyncQueue,
  MODELS_TO_SYNC_WITH_MEDITRAK,
);
initialiseNotifiers(models); // Notifies users of relevant changes, e.g. permissions granted

/**
 * Set up actual app with routes etc.
 */
const app = createApp(database, models);

/**
 * Start the server
 **/
const port = 8090;
http.createServer(app).listen(port);
winston.info(`Running on port ${port}`);

/**
 * Regularly sync data to the aggregation servers
 **/
startSyncWithDhis(models);

/**
 * Regularly sync data to MS1
 **/
startSyncWithMs1(models);

/**
 * Regularly sync actions that have happened on meditrak with the social feed.
 */
startFeedScraper(models);
