/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import { Express, NextFunction, Request, Response } from 'express';
import { IncomingMessage, ServerResponse } from 'http';
import {
  createProxyMiddleware,
  fixRequestBody,
  Options as ProxyOptions,
} from 'http-proxy-middleware';
import { UnauthenticatedError } from '@tupaia/utils';
import { handleError } from './handleError';
import { attachSession as defaultAttachSession } from '../orchestrator';
import { AuthHandler } from '@tupaia/api-client';

type AuthHandlerProvider = (req: Request) => AuthHandler;

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

const defaultAuthHandlerProvider = (req: Request) => {
  const { session } = req;

  if (!session) {
    throw new UnauthenticatedError('Session is not attached');
  }

  // Session already has a getAuthHeader function so can act as an AuthHandler
  return session;
};

type Middleware = (req: Request, res: Response, next: NextFunction) => void;

export const useForwardUnhandledRequests = (
  app: Express,
  target: string,
  prefix?: string,
  router?: ProxyOptions['router'],
  attachSession: Middleware = defaultAttachSession,
  authHandlerProvider: AuthHandlerProvider = defaultAuthHandlerProvider,
) => {
  const options = {
    target,
    router,
    changeOrigin: true,
    pathRewrite: (path: string) => {
      if (prefix && path.startsWith(prefix)) {
        path = path.replace(prefix, '');
      }

      // Remove the version string because version is already included in Meditrak base url.
      if (path.startsWith('/v')) {
        const secondSlashIndex = path.indexOf('/', 2);
        const version = parseFloat(path.substring(2, secondSlashIndex));
        return path.replace(`/v${version}`, '');
      }
      return path;
    },
    onProxyReq: fixRequestBody,
    onProxyRes: (proxyRes: IncomingMessage, req: IncomingMessage, res: ServerResponse) => {
      // To get around CORS because Admin Panel has credentials: true in fetch for session cookies
      // eslint-disable-next-line no-param-reassign
      const cors = res.getHeader('Access-Control-Allow-Origin');
      proxyRes.headers['Access-Control-Allow-Origin'] = typeof cors === 'number' ? undefined : cors;
    },
  };

  // Forward any unhandled request to central-server
  app.use(
    attachSession,
    attachAuthorizationHeader(authHandlerProvider),
    createProxyMiddleware(options),
    handleError,
  );
};
