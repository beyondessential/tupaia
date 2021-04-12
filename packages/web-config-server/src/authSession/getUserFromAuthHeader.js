/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import { getUserAndPassFromBasicAuth, getUserIDFromToken } from '@tupaia/auth';
import { TUPAIA_CONFIG_SERVER_DEVICE_NAME } from './constants';

const getUserFromBasicAuth = async (authenticator, authHeader) => {
  try {
    const { username: emailAddress, password } = getUserAndPassFromBasicAuth(authHeader);
    const { user } = await authenticator.authenticatePassword({
      emailAddress,
      password,
      deviceName: TUPAIA_CONFIG_SERVER_DEVICE_NAME,
    });
    return user;
  } catch (e) {
    return null;
  }
};

const getUserFromBearerAuth = async (models, authHeader) => {
  try {
    const userId = getUserIDFromToken(authHeader);
    return models.user.findById(userId);
  } catch (e) {
    return null;
  }
};

export const getUserFromAuthHeader = async req => {
  const { authenticator, headers, models } = req;
  const authHeader = headers.authorization || headers.Authorization;
  if (!authHeader) {
    return null;
  }

  if (authHeader.startsWith('Basic ')) {
    return getUserFromBasicAuth(authenticator, authHeader);
  }

  if (authHeader.startsWith('Bearer ')) {
    return getUserFromBearerAuth(models, authHeader);
  }

  return null;
};
