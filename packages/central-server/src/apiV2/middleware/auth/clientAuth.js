/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import { UnauthenticatedError, requireEnv } from '@tupaia/utils';
import { verifyPassword, getUserAndPassFromBasicAuth } from '@tupaia/auth';

export async function getAPIClientUser(authHeader, models) {
  const { username, password: secretKey } = getUserAndPassFromBasicAuth(authHeader);
  if (!username || !secretKey) {
    throw new UnauthenticatedError('The provided basic authorization header is invalid');
  }

  const API_CLIENT_SALT = requireEnv('API_CLIENT_SALT');

  // We always need a valid client; throw if none is found
  const apiClient = await models.apiClient.findOne({
    username,
  });
  const verified = await verifyPassword(secretKey, apiClient.secret_key_hash);
  if (!verified) {
    throw new UnauthenticatedError('Incorrect client username or secret');
  }
  return apiClient.getUser();
}
