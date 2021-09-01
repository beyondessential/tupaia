/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { Request, Response, NextFunction } from 'express';

import { UnauthenticatedError } from '@tupaia/utils';

import { hasBESAdminAccess } from '../utils';

export const verifyBESAdminAccess = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { session } = req;

    if (!session) {
      throw new UnauthenticatedError('Session is not attached');
    }

    hasBESAdminAccess(session.accessPolicy);

    next();
  } catch (error) {
    next(error);
  }
};
