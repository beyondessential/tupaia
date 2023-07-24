/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { Express } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { handleError } from './handleError';
import { attachSession as defaultAttachSession } from '../orchestrator';
import {
  AuthHandlerProvider,
  Middleware,
  attachAuthorizationHeader,
  defaultAuthHandlerProvider,
} from './proxyTypes';

export const addProxy = (
  app: Express,
  path: string,
  target: string,
  attachSession: Middleware = defaultAttachSession,
  authHandlerProvider: AuthHandlerProvider = defaultAuthHandlerProvider,
) => {
  app.use(
    `${path}$`,
    attachSession,
    attachAuthorizationHeader(authHandlerProvider),
    createProxyMiddleware({
      target,
      changeOrigin: true,
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
