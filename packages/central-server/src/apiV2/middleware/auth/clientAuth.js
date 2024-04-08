/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { UnauthenticatedError } from '@tupaia/utils';
import { encryptPassword, getUserAndPassFromBasicAuth } from '@tupaia/auth';

export async function getAPIClientUser(authHeader, models) {
  const { username, password: secretKey } = getUserAndPassFromBasicAuth(authHeader);
  if (!username || !secretKey) {
    throw new UnauthenticatedError('The provided basic authorization header is invalid');
  }

  const { API_CLIENT_SALT } = process.env;

  // We always need a valid client; throw if none is found
  const secretKeyHash = encryptPassword(secretKey, API_CLIENT_SALT);
  const apiClient = await models.apiClient.findOne({
    username,
    secret_key_hash: secretKeyHash,
  });
  if (!apiClient) {
    throw new UnauthenticatedError('Incorrect client username or secret');
  }
  return apiClient.getUser();
}
