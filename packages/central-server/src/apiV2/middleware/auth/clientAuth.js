/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { UnauthenticatedError } from '@tupaia/utils';
import { getUserAndPassFromBasicAuth } from '@tupaia/auth';

export async function getAPIClientUser(authHeader, models) {
  const { username, password } = getUserAndPassFromBasicAuth(authHeader);
  if (!username || !password) {
    throw new UnauthenticatedError('The provided basic authorization header is invalid');
  }

  // We always need a valid client; throw if none is found
  const apiClient = await models.apiClient.findOne({
    username,
  });

  if (!apiClient) {
    throw new UnauthenticatedError('Incorrect client username or password');
  }

  const apiClientUser = await apiClient.getUser();
  if (!apiClientUser.checkPassword(password)) {
    throw new UnauthenticatedError('Incorrect client username or password');
  }

  return apiClientUser;
}
