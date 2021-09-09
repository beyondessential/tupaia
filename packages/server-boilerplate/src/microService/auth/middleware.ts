/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { Request, NextFunction, Response } from 'express';
import { UnauthenticatedError } from '@tupaia/utils';
import { AccessPolicy } from '@tupaia/access-policy';
import { Authenticator, getUserAndPassFromBasicAuth, getJwtToken } from '@tupaia/auth';

import { AccessPolicyObject } from '../../types';

const getBearerAccessPolicy = async (
  authenticator: Authenticator,
  authHeader: string,
): Promise<AccessPolicyObject> => {
  // Use the user account provided in the auth header if present
  const accessToken = getJwtToken(authHeader);

  const { accessPolicy } = await authenticator.authenticateAccessToken(accessToken);
  return accessPolicy;
};

const getBasicAccessPolicy = async (
  authenticator: Authenticator,
  authHeader: string,
  apiName: string,
): Promise<AccessPolicyObject> => {
  const { username, password } = getUserAndPassFromBasicAuth(authHeader);

  // first attempt to authenticate as an api client, in case a secret key was used in the auth header
  try {
    const { accessPolicy } = await authenticator.authenticateApiClient({
      username,
      secretKey: password,
    });
    return accessPolicy;
  } catch (error) {
    // attempting to authenticate as api client failed
  }

  // api client auth failed, attempt to authenticate as a regular user
  const { user, accessPolicy } = await authenticator.authenticatePassword({
    emailAddress: username,
    password,
    deviceName: apiName,
  });
  if (user) {
    return accessPolicy;
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

    let accessPolicyObject: AccessPolicyObject;
    if (authHeader.startsWith('Bearer')) {
      accessPolicyObject = await getBearerAccessPolicy(authenticator, authHeader);
    } else if (authHeader.startsWith('Basic')) {
      accessPolicyObject = await getBasicAccessPolicy(authenticator, authHeader, apiName);
    } else {
      throw new UnauthenticatedError('Could not authenticate');
    }

    req.accessPolicy = new AccessPolicy(accessPolicyObject);
    next();
  } catch (error) {
    next(error);
  }
};
