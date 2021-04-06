/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { Request, Response, NextFunction } from 'express';
import { UnauthenticatedError } from '@tupaia/utils';
import { SessionType } from '../models/Session';

export const attachSession = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessionId = req.sessionCookie?.id;
    if (!sessionId) {
      throw new UnauthenticatedError('User not authenticated');
    }

    const session: SessionType = await req.sessionModel.findById(sessionId);
    if (!session) {
      throw new UnauthenticatedError('Session not found in database');
    }

    req.session = session;

    next();
  } catch (error) {
    next(error);
  }
};
