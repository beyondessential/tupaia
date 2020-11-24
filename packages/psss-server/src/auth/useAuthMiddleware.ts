/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { PermissionsError, UnauthenticatedError } from '@tupaia/utils';
import { AccessPolicy } from '@tupaia/access-policy';
import { ModelRegistry } from '@tupaia/database';
import { Response, NextFunction, Express } from 'express';
import session from 'client-sessions';
import { PsssRequest } from '../types';

const PSSS_PERMISSION_GROUP = 'PSSS';

const checkUserPermissions = async (models: ModelRegistry, sessionId: string) => {
  const session = await models.psssSession.findById(sessionId);
  const { accessPolicy } = session;
  return accessPolicy.allowsSome([], PSSS_PERMISSION_GROUP);
};

export const authMiddleware = async (req: PsssRequest, res: Response, next: NextFunction) => {
  // the login route needs no auth
  if (req.path.endsWith('/login')) {
    next();
    return;
  }

  if (!req.session || !req.session.id) {
    next(new UnauthenticatedError('User not authenticated'));
    return;
  }

  const authorized = await checkUserPermissions(req.models, req.session.id);
  if (!authorized) {
    next(new PermissionsError('User not authorized for PSSS'));
    return;
  }

  next();
};

const USER_SESSION_COOKIE_TIMEOUT = 24 * 60 * 60 * 1000; // session lasts 24 hours
export const USER_SESSION_CONFIG = {
  cookieName: 'session',
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
