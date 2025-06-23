import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import errorHandler from 'api-error-handler';
import morgan from 'morgan';
import publicIp from 'public-ip';
import { Authenticator } from '@tupaia/auth';
import { buildBasicBearerAuthMiddleware } from '@tupaia/server-boilerplate';
import { handleError } from './apiV2/middleware';
import { apiV2 } from './apiV2';

const TRUSTED_PROXIES_INTERVAL = 60000; // 1 minute

/**
 * Dynamically set trusted proxy so that we can trust the IP address of the client
 */
function setTrustedProxies(app) {
  const trustedProxyIPs = process.env.TRUSTED_PROXY_IPS
    ? process.env.TRUSTED_PROXY_IPS.split(',').map(ip => ip.trim())
    : [];

  publicIp
    .v4()
    .then(publicIp => {
      app.set('trust proxy', ['loopback', ...trustedProxyIPs, publicIp]);
    })
    .catch(err => {
      console.error('Error fetching public IP:', err);
    });
}

/**
 * Set up express server with middleware,
 */
export function createApp(database, models) {
  const app = express();

  /**
   * Call the setTrustedProxies function periodically to update the trusted proxies
   * because it's possible for the server's IP address to change while server is running
   */
  setTrustedProxies(app); // Call it once immediately
  setInterval(() => setTrustedProxies(app), TRUSTED_PROXIES_INTERVAL);

  /**
   * Add middleware
   */
  app.use(cors());
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(errorHandler());

  /**
   * Access logs
   */
  if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
  }

  /**
   * Add singletons to be attached to req for every route
   */
  const authenticator = new Authenticator(models);
  app.use((req, res, next) => {
    req.database = database;
    req.models = models;
    req.authenticator = authenticator;
    next();
  });

  /**
   * Add the basic authenticator to all routes
   */
  app.use(buildBasicBearerAuthMiddleware('central-server', authenticator), handleError);
  app.use((req, res, next) => {
    req.userId = req.user.id;
    next();
  });

  /**
   * Add all routes to the app
   */
  app.use('/v2', apiV2);

  return app;
}
