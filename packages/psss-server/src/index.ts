/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import '@babel/polyfill';

import * as dotenv from 'dotenv';
import http from 'http';
import { TupaiaDatabase } from '@tupaia/database';

import { createApp } from './app';
import winston from './log';
import { PsssSessionModel } from './models';

dotenv.config(); // Load the environment variables into process.env

/**
 * Set up database
 */
const database = new TupaiaDatabase();
const sessionModel = new PsssSessionModel(database);

/**
 * Set up app with routes etc.
 */
const app = createApp(sessionModel);

/**
 * Start the server
 */
const port = process.env.PORT || 8040;
http.createServer(app).listen(port);
winston.info(`Running on port ${port}`);

/**
 * Notify PM2 that we are ready
 * */
if (process.send) {
  process.send('ready');
}
