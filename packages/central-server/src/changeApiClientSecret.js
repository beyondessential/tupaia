/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import '@babel/polyfill';
import { prompt } from 'promptly';

import {} from 'dotenv/config'; // Load the environment variables into process.env
import { TupaiaDatabase } from '@tupaia/database';

import { encryptPassword } from '@tupaia/auth';
import winston from './log';

(async () => {
  const username = await prompt('Api Client username: ');
  const newSecret = await prompt('Api Client new secret: ');

  if (!username) throw new Error('Safety exit'); // should never happen

  const newSecretKeyHash = encryptPassword(newSecret, process.env.API_CLIENT_SALT);

  const database = new TupaiaDatabase();
  await database.update('api_client', { username }, { secret_key_hash: newSecretKeyHash });

  winston.info(`Changed api client secret`);
  await database.closeConnections();
})();
