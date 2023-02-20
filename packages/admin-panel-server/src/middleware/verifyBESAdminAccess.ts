/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { Request, Response, NextFunction } from 'express';

import { AccessPolicy } from '@tupaia/access-policy';
import { PermissionsError, UnauthenticatedError } from '@tupaia/utils';

import { BES_ADMIN_PERMISSION_GROUP } from '../constants';

const hasBESAdminAccess = (accessPolicy: AccessPolicy) => {
  const hasAccess = accessPolicy.allowsSome(undefined, BES_ADMIN_PERMISSION_GROUP);
  if (!hasAccess) {
    throw new PermissionsError(`Need ${BES_ADMIN_PERMISSION_GROUP} access`);
  }

  return hasAccess;
};

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
