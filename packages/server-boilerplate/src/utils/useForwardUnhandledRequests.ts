/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import { Express, NextFunction, Request, Response } from 'express';
import { IncomingMessage, ServerResponse } from 'http';
import { createProxyMiddleware, fixRequestBody } from 'http-proxy-middleware';
import { UnauthenticatedError } from '@tupaia/utils';
import { handleError } from './handleError';
import { attachSession as defaultAttachSession } from '../orchestrator';

const attachAuthorizationHeader = async (req: Request, res: Response, next: NextFunction) => {
  const { session } = req;

  if (!session) {
    throw new UnauthenticatedError('Session is not attached');
  }

  req.headers.authorization = await session.getAuthHeader();

  next();
};

type Middleware = (req: Request, res: Response, next: NextFunction) => void;

export const useForwardUnhandledRequests = (
  app: Express,
  target: string,
  prefix?: string,
  attachSession: Middleware = defaultAttachSession,
) => {
  const options = {
    target,
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
      const cors = res.getHeader('Access-Control-Allow-Origin')
      proxyRes.headers['Access-Control-Allow-Origin'] = typeof cors === 'number' ? undefined : cors;
    },
  };

  // Forward any unhandled request to meditrak-server
  app.use(attachSession, attachAuthorizationHeader, createProxyMiddleware(options), handleError);
};
