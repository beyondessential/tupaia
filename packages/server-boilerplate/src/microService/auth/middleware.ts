/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { Request, NextFunction, Response } from 'express';
import { UnauthenticatedError } from '@tupaia/utils';
import { AccessPolicy } from '@tupaia/access-policy';
import { Authenticator, getUserAndPassFromBasicAuth, getJwtToken } from '@tupaia/auth';

import { AccessPolicyObject } from '../../types';
import { UserType } from '../../models';

const getBearerAccessPolicy = async (authenticator: Authenticator, authHeader: string) => {
  // Use the user account provided in the auth header if present
  const accessToken = getJwtToken(authHeader);

  return authenticator.authenticateAccessToken(accessToken);
};

const getBasicAccessPolicy = async (
  authenticator: Authenticator,
  authHeader: string,
  apiName: string,
) => {
  const { username, password } = getUserAndPassFromBasicAuth(authHeader);

  // first attempt to authenticate as an api client, in case a secret key was used in the auth header
  try {
    return await authenticator.authenticateApiClient({
      username,
      secretKey: password,
    });
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
    return { user, accessPolicy };
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

    let userObject: UserType;
    let accessPolicyObject: AccessPolicyObject;
    if (authHeader.startsWith('Bearer')) {
      const { user, accessPolicy } = await getBearerAccessPolicy(authenticator, authHeader);
      userObject = user;
      accessPolicyObject = accessPolicy;
    } else if (authHeader.startsWith('Basic')) {
      const { user, accessPolicy } = await getBasicAccessPolicy(authenticator, authHeader, apiName);
      userObject = user;
      accessPolicyObject = accessPolicy;
    } else {
      throw new UnauthenticatedError('Could not authenticate');
    }

    req.user = userObject;
    req.accessPolicy = new AccessPolicy(accessPolicyObject);
    next();
  } catch (error) {
    next(error);
  }
};
