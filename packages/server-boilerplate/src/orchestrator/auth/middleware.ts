/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { Request, NextFunction, Response } from 'express';

import { UnauthenticatedError } from '@tupaia/utils';
import { AccessPolicy } from '@tupaia/access-policy';
import { getJwtToken } from '@tupaia/auth';

import { AuthConnection } from './AuthConnection';

export const buildOrchestratorBearerAuthMiddleware = () => async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer')) {
      throw new UnauthenticatedError(
        'No authorization header provided - must be Bearer Auth Header',
      );
    }
    
    const accessToken = getJwtToken(authHeader);
    const authConnection = new AuthConnection();
    const { accessPolicy: accessPolicyObject } = await authConnection.authenticateAccessToken(accessToken);

    req.accessPolicy = new AccessPolicy(accessPolicyObject);

    next();
  } catch (error) {
    next(error);
  }
};
