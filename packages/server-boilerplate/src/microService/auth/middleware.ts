/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { Request, NextFunction, Response } from 'express';
import { UnauthenticatedError } from '@tupaia/utils';
import { AccessPolicy } from '@tupaia/access-policy';
import { Authenticator, getUserIDFromToken, getUserAndPassFromBasicAuth } from '@tupaia/auth';

const authenticateBearerAuthHeader = async (authHeader: string) => {
  // Use the user account provided in the auth header if present
  const tokenUserID = getUserIDFromToken(authHeader);
  if (tokenUserID) {
    return tokenUserID;
  }

  throw new UnauthenticatedError('Could not pass auth token');
};

const authenticateBasicAuthHeader = async (
  authenticator: Authenticator,
  authHeader: string,
  apiName: string,
) => {
  const { username, password } = getUserAndPassFromBasicAuth(authHeader);
  const { user } = await authenticator.authenticatePassword({
    emailAddress: username,
    password,
    deviceName: apiName,
  });
  if (user) {
    return user.id;
  }

  throw new UnauthenticatedError('Could not find user');
};

export const buildBasicBearerAuthMiddleware = (
  apiName: string,
  authenticator: Authenticator,
) => async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new UnauthenticatedError(
        'No authorization header provided - must be Basic or Bearer Auth Header',
      );
    }

    let userId: string;
    if (authHeader.startsWith('Bearer')) {
      userId = await authenticateBearerAuthHeader(authHeader);
    } else if (authHeader.startsWith('Basic')) {
      userId = await authenticateBasicAuthHeader(authenticator, authHeader, apiName);
    } else {
      throw new UnauthenticatedError('Could not authenticate with the provided access token');
    }

    if (userId) {
      const accessPolicy = await authenticator.getAccessPolicyForUser(userId);
      req.accessPolicy = new AccessPolicy(accessPolicy);
    }
    next();
  } catch (error) {
    next(error);
  }
};
