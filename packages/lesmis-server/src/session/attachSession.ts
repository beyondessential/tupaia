/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { Request, Response, NextFunction } from 'express';
import { SessionType } from '@tupaia/server-boilerplate';
import { UnauthenticatedError } from '@tupaia/utils';

export const attachSession = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessionId = req.sessionCookie?.id;
    if (!sessionId) {
      // within lesmis-server, not having a session means the route handlers will use the default
      // public lesmis server user auth header
      next();
      return;
    }

    const session: SessionType = await req.sessionModel.findById(sessionId);
    if (!session) {
      res.clearCookie('sessionCookie'); // Remove the session cookie from the front end
      throw new UnauthenticatedError('Session not found in database');
    }

    req.session = session;

    next();
    return;
  } catch (error) {
    next(error);
  }
};
