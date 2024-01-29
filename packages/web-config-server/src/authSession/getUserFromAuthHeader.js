/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import { getUserAndPassFromBasicAuth, getTokenClaimsFromBearerAuth } from '@tupaia/auth';

const getApiClientUserFromBasicAuth = async (models, authHeader) => {
  const { username, password } = getUserAndPassFromBasicAuth(authHeader);

  // first attempt to authenticate as an api client
  const apiClient = await models.apiClient.findOne({
    username,
  });
  if (!apiClient) {
    return undefined;
  }

  const apiClientUser = await apiClient.getUser();
  if (!apiClientUser.checkPassword(password)) {
    return undefined;
  }

  return apiClientUser;
};

const getUserFromBearerAuth = async (models, authHeader) => {
  try {
    const { userId } = getTokenClaimsFromBearerAuth(authHeader);
    return models.user.findById(userId);
  } catch (e) {
    return null;
  }
};

export const getUserFromAuthHeader = async req => {
  const { headers, models } = req;
  const authHeader = headers.authorization || headers.Authorization;
  if (!authHeader) {
    return null;
  }

  if (authHeader.startsWith('Basic ')) {
    return getApiClientUserFromBasicAuth(models, authHeader);
  }

  if (authHeader.startsWith('Bearer ')) {
    return getUserFromBearerAuth(models, authHeader);
  }

  return null;
};
