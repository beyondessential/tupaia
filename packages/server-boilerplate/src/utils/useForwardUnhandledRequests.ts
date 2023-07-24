/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import { Express } from 'express';
import { IncomingMessage, ServerResponse } from 'http';
import { createProxyMiddleware, fixRequestBody } from 'http-proxy-middleware';
import { handleError } from './handleError';
import { attachSession as defaultAttachSession } from '../orchestrator';
import {
  AuthHandlerProvider,
  Middleware,
  attachAuthorizationHeader,
  defaultAuthHandlerProvider,
} from './proxyTypes';

export const useForwardUnhandledRequests = (
  app: Express,
  target: string,
  prefix?: string,
  attachSession: Middleware = defaultAttachSession,
  authHandlerProvider: AuthHandlerProvider = defaultAuthHandlerProvider,
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
