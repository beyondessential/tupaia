/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { Request, NextFunction, Response } from 'express';
import { UnauthenticatedError } from '@tupaia/utils';
import { AccessPolicy } from '@tupaia/access-policy';
import {
  Authenticator,
  encryptPassword,
  getTokenClaimsFromBearerAuth,
  getUserAndPassFromBasicAuth,
} from '@tupaia/auth';
import { ModelRegistry } from '@tupaia/database';

const authenticateBearerAuthHeader = async (authHeader: string) => {
  // Use the user account provided in the auth header if present
  const { userId } = getTokenClaimsFromBearerAuth(authHeader);
  if (userId) {
    return userId;
  }

  throw new UnauthenticatedError('Could not authenticate with the provided access token');
};

const attemptApiClientAuthentication = async (
  models: ModelRegistry,
  { username, secretKey }: { username: string; secretKey: string },
) => {
  const secretKeyHash = encryptPassword(secretKey, process.env.API_CLIENT_SALT);
  const apiClient = await models.apiClient.findOne({
    username,
    secret_key_hash: secretKeyHash,
  });
  return apiClient && apiClient.getUser();
};

const authenticateBasicAuthHeader = async (
  models: ModelRegistry,
  authenticator: Authenticator,
  authHeader: string,
  apiName: string,
) => {
  const { username, password } = getUserAndPassFromBasicAuth(authHeader);

  // first attempt to authenticate as an api client, in case a secret key was used in the auth header
  const apiClientUser = await attemptApiClientAuthentication(models, {
    username,
    secretKey: password,
  });
  if (apiClientUser) {
    return apiClientUser.id;
  }

  // api client auth failed, attempt to authenticate as a regular user
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
      userId = await authenticateBasicAuthHeader(req.models, authenticator, authHeader, apiName);
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
