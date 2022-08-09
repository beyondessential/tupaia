import winston from 'winston';
import { createApp } from './app';
import { runPreaggregation } from './preaggregation/runPreaggregation';

async function start() {
  if (process.env.RUN_PREAGGREGATION) {
    runPreaggregation(process.env.RUN_PREAGGREGATION);
  } else {
    const app = await createApp();

    // process.env.PORT as per run command PORT=XXXX npm run dev
    const port = process.env.PORT || 8080;
    app.server.listen(port);
    winston.debug('Logging at debug level');
    winston.info(`Running on port ${port}`);
    const aggregationDescription = process.env.AGGREGATION_URL_PREFIX || 'production';
    winston.info(`Connected to ${aggregationDescription} aggregation`);

    if (process.send) {
      process.send('ready'); // Notify PM2 that we are ready
    }
  }
}

start();
