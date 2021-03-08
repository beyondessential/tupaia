/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { UnauthenticatedError, DatabaseError } from '@tupaia/utils';
import { encryptPassword, getUserAndPassFromBasicAuth } from '@tupaia/auth';

async function getAPIClient(authHeader, apiClientModel) {
  const { username, password: secretKey } = getUserAndPassFromBasicAuth(authHeader);
  if (!username || !secretKey) {
    throw new UnauthenticatedError('The provided basic authorization header is invalid');
  }

  // Still check against environment variables so that these
  // updates can be deployed without breaking the app. This
  // check can be removed once the proper credentials have been
  // added to the production database.
  const { API_CLIENT_SALT, CLIENT_USERNAME, CLIENT_SECRET } = process.env;
  if (
    CLIENT_SECRET &&
    CLIENT_USERNAME &&
    username === CLIENT_USERNAME &&
    secretKey === CLIENT_SECRET
  ) {
    return { username: 'env', user_account_id: null };
  }

  // We always need a valid client; throw if none is found
  const secretKeyHash = encryptPassword(secretKey, API_CLIENT_SALT);
  const apiClient = await apiClientModel.findOne({
    username,
    secret_key_hash: secretKeyHash,
  });
  if (!apiClient) {
    throw new UnauthenticatedError('Incorrect client username or secret');
  }
  return apiClient;
}

export async function getAPIClientUser(authHeader, models) {
  const apiClient = await getAPIClient(authHeader, models.apiClient);

  const userId = apiClient.user_account_id;

  // If the api client is not associated with a user, e.g. meditrak api client,
  // the consuming function should auth the user separately
  if (!userId) return null;

  const user = await models.user.findOne({ id: userId });
  if (!user) {
    // This isn't an authentication error - the client has provided the correct
    // name and key, but the api client record has an invalid user ID attached!
    throw new DatabaseError('API user does not exist');
  }

  return user;
}
