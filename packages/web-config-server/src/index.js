import winston from 'winston';

import { getEnvVarOrDefault } from '@tupaia/utils';
import { configureWinston } from '@tupaia/server-boilerplate';

import { createApp } from './app';
import { configureEnv } from './configureEnv';
import { runPreaggregation } from './preaggregation/runPreaggregation';

configureWinston();
configureEnv();

async function start() {
  if (process.env.RUN_PREAGGREGATION) {
    runPreaggregation(process.env.RUN_PREAGGREGATION);
  } else {
    const app = await createApp();

    // process.env.PORT as per run command PORT=XXXX npm run dev
    const port = process.env.PORT || 8000;
    app.server.listen(port);
    winston.info(`Running on port ${port}`);
    winston.info(`Logging at ${winston.level} level`);
    winston.debug(`Time zone is ${Intl.DateTimeFormat().resolvedOptions().timeZone}`);
    const aggregationDescription = getEnvVarOrDefault('AGGREGATION_URL_PREFIX', 'production');
    winston.info(`Connected to ${aggregationDescription} aggregation`);

    if (process.send) {
      process.send('ready'); // Notify PM2 that we are ready
    }
  }
}

start();
