/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import { NextFunction, Request, Response } from 'express';
import { IncomingMessage, ServerResponse } from 'http';
import { createProxyMiddleware, fixRequestBody } from 'http-proxy-middleware';
import { AuthHandler } from '@tupaia/api-client';
import { UnauthenticatedError } from '@tupaia/utils';

type AuthHandlerProvider = (req: Request) => AuthHandler;

const defaultAuthHandlerProvider = (req: Request) => {
  const { session } = req;

  if (!session) {
    throw new UnauthenticatedError('Session is not attached');
  }

  // Session already has a getAuthHeader function so can act as an AuthHandler
  return session;
};

const stripVersionFromPath = (path: string) => {
  if (path.startsWith('/v')) {
    const secondSlashIndex = path.indexOf('/', 2);
    const version = parseFloat(path.substring(2, secondSlashIndex));
    return path.replace(`/v${version}`, '');
  }
  return path;
};

export const forwardRequest = (
  target: string,
  options: {
    authHandlerProvider?: AuthHandlerProvider;
  } = {},
) => {
  const { authHandlerProvider = defaultAuthHandlerProvider } = options;
  const proxyOptions = {
    target,
    changeOrigin: true,
    pathRewrite: stripVersionFromPath,
    onProxyReq: fixRequestBody,
    onProxyRes: (proxyRes: IncomingMessage, req: IncomingMessage, res: ServerResponse) => {
      // To get around CORS because Admin Panel has credentials: true in fetch for session cookies
      const cors = res.getHeader('Access-Control-Allow-Origin');
      // eslint-disable-next-line no-param-reassign
      proxyRes.headers['Access-Control-Allow-Origin'] = typeof cors === 'number' ? undefined : cors;
    },
  };

  const proxyMiddleware = createProxyMiddleware(proxyOptions);
  return async (req: Request, res: Response, next: NextFunction) => {
    console.log(`forwarding ${req.path} to ${target}`);
    const authHandler = authHandlerProvider(req);
    req.headers.authorization = await authHandler.getAuthHeader();
    proxyMiddleware(req, res, next);
  };
};
