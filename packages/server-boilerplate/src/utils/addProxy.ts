/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { Express, NextFunction, Request, Response } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { AuthHandler } from '@tupaia/api-client';
import { handleError } from './handleError';

type AuthHandlerProvider = (req: Request) => AuthHandler;
type Middleware = (req: Request, res: Response, next: NextFunction) => void;
// Create a middleware function using the given authHandler
const attachAuthorizationHeader = (authHandlerProvider: AuthHandlerProvider) => async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHandler = authHandlerProvider(req);
  req.headers.authorization = await authHandler.getAuthHeader();
  next();
};

export const addProxy = (
  app: Express,
  path: string,
  target: string,
  attachSession: Middleware,
  authHandlerProvider: AuthHandlerProvider,
) => {
  console.log('addProxy', path);
  app.use(
    `${path}$`,
    attachSession,
    attachAuthorizationHeader(authHandlerProvider),
    createProxyMiddleware({
      target,
      changeOrigin: true,
      logLevel: 'debug',
      pathRewrite: (currentPath: string) => {
        // Remove the version string because version is already included in Meditrak base url.
        if (currentPath.startsWith('/v')) {
          const secondSlashIndex = currentPath.indexOf('/', 2);
          const version = parseFloat(currentPath.substring(2, secondSlashIndex));
          return currentPath.replace(`/v${version}`, '');
        }
        return currentPath;
      },
    }),
    handleError,
  );
};
