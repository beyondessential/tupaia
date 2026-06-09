import http from 'http';
import path from 'path';

import winston from 'winston';
import { configureWinston } from '@tupaia/server-boilerplate';
import { configureDotEnv } from '@tupaia/server-utils';
import { createApp } from './app';
import { PromptManager } from './viz-builder/prompts/PromptManager';

configureWinston();

configureDotEnv([
  path.resolve(__dirname, '../../../env/servers.env'),
  path.resolve(__dirname, '../../../env/db.env'),
  path.resolve(__dirname, '../../../env/api-client.env'),
  path.resolve(__dirname, '../.env'),
]);

(async () => {
  const promptManager = new PromptManager();
  /**
   * Set up app with routes etc.
   */
  const app = await createApp(promptManager);

  /**
   * Start the server
   */
  const port = process.env.PORT || 8070;
  http.createServer(app).listen(port);
  winston.info(`Running on port ${port}`);
  winston.info(`Logging at ${winston.level} level`);
  winston.debug(`Time zone is ${Intl.DateTimeFormat().resolvedOptions().timeZone}`);

  /**
   * Notify PM2 that we are ready
   * */
  if (process.send) {
    process.send('ready');
  }
})();
