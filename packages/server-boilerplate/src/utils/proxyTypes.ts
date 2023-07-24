/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { NextFunction, Request, Response } from 'express';
import { AuthHandler } from '@tupaia/api-client';
import { UnauthenticatedError } from '@tupaia/utils';

export type AuthHandlerProvider = (req: Request) => AuthHandler;
export type Middleware = (req: Request, res: Response, next: NextFunction) => void;

// Create a middleware function using the given authHandler
export const attachAuthorizationHeader = (authHandlerProvider: AuthHandlerProvider) => async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHandler = authHandlerProvider(req);
  req.headers.authorization = await authHandler.getAuthHeader();
  next();
};

export const defaultAuthHandlerProvider = (req: Request) => {
  const { session } = req;

  if (!session) {
    throw new UnauthenticatedError('Session is not attached');
  }

  // Session already has a getAuthHeader function so can act as an AuthHandler
  return session;
};
