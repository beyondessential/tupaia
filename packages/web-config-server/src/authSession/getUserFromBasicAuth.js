/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import { getUserAndPassFromBasicAuth } from '@tupaia/auth';
import { TUPAIA_CONFIG_SERVER_DEVICE_NAME } from './constants';

export const getUserFromBasicAuth = async req => {
  const { authenticator, headers } = req;
  const authHeader = headers.authorization || headers.Authorization;
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return null;
  }

  try {
    const { username: emailAddress, password } = getUserAndPassFromBasicAuth(authHeader);
    const { user } = await authenticator.authenticatePassword({
      emailAddress,
      password,
      deviceName: TUPAIA_CONFIG_SERVER_DEVICE_NAME,
    });
    return user.fullName;
  } catch (e) {
    return null;
  }
};
