/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { PermissionsError, UnauthenticatedError } from '@tupaia/utils';
import { Response, NextFunction, Express } from 'express';
import session from 'client-sessions';
import { PsssRequest } from '../types';
import { PsssSessionType } from '../models/PsssSession';

const PSSS_PERMISSION_GROUP = 'PSSS';

const checkUserPermissions = async (session: PsssSessionType) => {
  const { accessPolicy } = session;
  return accessPolicy.allowsSome([], PSSS_PERMISSION_GROUP);
};

export const authMiddleware = async (req: PsssRequest, res: Response, next: NextFunction) => {
  // the login route needs no auth
  if (req.path.endsWith('/login')) {
    next();
    return;
  }

  const { sessionId, sessionModel } = req;

  if (!sessionId) {
    next(new UnauthenticatedError('User not authenticated'));
    return;
  }

  const session = await sessionModel.findById(sessionId);
  if (!session) {
    next(new UnauthenticatedError('Session not found in database'));
  }

  const authorized = await checkUserPermissions(session);
  if (!authorized) {
    next(new PermissionsError('User not authorized for PSSS'));
    return;
  }

  req.session = session;
  next();
};

const USER_SESSION_COOKIE_TIMEOUT = 24 * 60 * 60 * 1000; // session lasts 24 hours
export const USER_SESSION_CONFIG = {
  cookieName: 'sessionId',
  secret: process.env.USER_SESSION_COOKIE_SECRET || '',
  secure: false,
  httpOnly: false,
  duration: USER_SESSION_COOKIE_TIMEOUT,
  activeDuration: USER_SESSION_COOKIE_TIMEOUT,
};

export const useAuthMiddleware = (app: Express) => {
  // main session
  app.use(session(USER_SESSION_CONFIG));
  app.use(authMiddleware);
};
