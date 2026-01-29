import http from 'http';
import winston from 'winston';
import { DataTableDatabase } from '@tupaia/database';
import { configureWinston } from '@tupaia/server-boilerplate';
import { createApp } from './app';
import { configureEnv } from './configureEnv';

configureWinston();
configureEnv();

(async () => {
  const database = new DataTableDatabase();

  /**
   * Set up app with routes etc.
   */
  const app = createApp(database);

  /**
   * Start the server
   */
  const port = process.env.PORT || 8010;
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
