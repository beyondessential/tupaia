import http from 'http';
import winston from 'winston';
import { configureWinston } from '@tupaia/server-boilerplate';
import { createApp } from './app';
import { configureEnv } from './configureEnv';

configureWinston();
configureEnv();

(async () => {
  /**
   * Set up app with routes etc.
   */
  const app = await createApp();

  /**
   * Start the server
   */
  const port = process.env.PORT || 8050;
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
