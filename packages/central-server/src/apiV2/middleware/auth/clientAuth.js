import { getUserAndPassFromBasicAuth } from '@tupaia/auth';
import { UnauthenticatedError } from '@tupaia/utils';

export async function getAPIClientUser(authHeader, models) {
  const { username, password: secretKey } = getUserAndPassFromBasicAuth(authHeader);
  if (!username || !secretKey) {
    throw new UnauthenticatedError('The provided basic authorization header is invalid');
  }

  // We always need a valid client; throw if none is found
  const apiClient = await models.apiClient.findOne({ username });
  if (!apiClient) {
    throw new UnauthenticatedError(`Couldn’t find API client`);
  }

  const isVerified = await apiClient.verifySecretKey(secretKey);
  if (!isVerified) {
    throw new UnauthenticatedError(`Couldn’t authenticate API client`);
  }

  return await apiClient.getUser();
}
