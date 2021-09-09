/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { Request, Response, NextFunction } from 'express';

import { UnauthenticatedError } from '@tupaia/utils';

export const attachAuthorizationHeader = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { session } = req;

  if (!session) {
    throw new UnauthenticatedError('Session is not attached');
  }

  req.headers.authorization = await session.getAuthHeader();

  next();
}
