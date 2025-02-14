import { Request, Response, NextFunction } from 'express';
import { UnauthenticatedError } from '@tupaia/utils';
import { SessionRecord } from '../models/Session';

export const attachSession = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessionId = req.sessionCookie?.id;
    if (!sessionId) {
      throw new UnauthenticatedError('Session not found or has expired. Please log in again.');
    }

    const session: SessionRecord = await req.sessionModel.findById(sessionId);
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
  // Same as above but don't throw errors on failure
  const sessionId = req.sessionCookie?.id;
  if (sessionId) {
    const session: SessionRecord = await req.sessionModel.findById(sessionId);
    if (session) {
      req.session = session;
    }
  }
  next();
};
