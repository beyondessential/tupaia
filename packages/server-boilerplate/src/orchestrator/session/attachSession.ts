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
      throw new UnauthenticatedError('Session not found or has expired. Please log in again.');
    }

    const session: SessionType = await req.sessionModel.findById(sessionId);
    if (!session) {
      res.clearCookie('sessionCookie'); // Remove the session cookie from the front end
      throw new UnauthenticatedError('Session not found in database');
    }

    req.session = session;

    next();
  } catch (error) {
    next(error);
  }
};

export const attachSessionIfAvailable = async (req: Request, res: Response, next: NextFunction) => {
  // Discard authorization errors from attach session so function succeeds even if session doesn't exist
  const UNAUTHORIZED_STATUS_CODE = 401;
  try {
    attachSession(req, res, next);
  } catch(error: any) {
    if (error.statusCode === UNAUTHORIZED_STATUS_CODE) {
      next();
    } else {
      next(error);
    }
  }
};
