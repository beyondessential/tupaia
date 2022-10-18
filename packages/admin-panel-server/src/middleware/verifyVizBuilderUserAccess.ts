/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { Request, Response, NextFunction } from 'express';

import { UnauthenticatedError } from '@tupaia/utils';

import { hasVizBuilderUserAccess } from '../utils';

export const verifyVizBuilderUserAccess = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { session } = req;

    if (!session) {
      throw new UnauthenticatedError('Session is not attached');
    }

    hasVizBuilderUserAccess(session.accessPolicy);

    next();
  } catch (error) {
    next(error);
  }
};
