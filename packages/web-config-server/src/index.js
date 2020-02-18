import winston from 'winston';
import { createApp } from './app';
import { runPreaggregation } from './preaggregation/runPreaggregation';

if (process.env.RUN_PREAGGREGATION) {
  runPreaggregation(process.env.RUN_PREAGGREGATION);
} else {
  var app = createApp();

  // process.env.PORT as per run command PORT=XXXX npm run dev
  app.server.listen(process.env.PORT || 8080);
  winston.debug('Logging at debug level');
  winston.info('Server started', { port: app.server.address().port });
}
