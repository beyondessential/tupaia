import { getTokenClaimsFromBearerAuth, getUserAndPassFromBasicAuth } from '@tupaia/auth';

const getApiClientUserFromBasicAuth = async (models, authHeader) => {
  const { username, password: secretKey } = getUserAndPassFromBasicAuth(authHeader);

  // first attempt to authenticate as an api client, in case a secret key was used in the auth header
  const apiClient = await models.apiClient.findOne({
    username,
  });
  if (!apiClient) return undefined;

  const verified = await apiClient.verifySecretKey(secretKey);
  return verified ? await apiClient.getUser() : undefined;
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
