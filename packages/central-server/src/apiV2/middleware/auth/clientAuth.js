import { getUserAndPassFromBasicAuth, verifyPassword } from '@tupaia/auth';
import { UnauthenticatedError } from '@tupaia/utils';

export async function getAPIClientUser(authHeader, models) {
  const { username, password: secretKey } = getUserAndPassFromBasicAuth(authHeader);
  if (!username || !secretKey) {
    throw new UnauthenticatedError('The provided basic authorization header is invalid');
  }

  // We always need a valid client; throw if none is found
  const apiClient = await models.apiClient.findOne({
    username,
  });
  if (!apiClient) throw new UnauthenticatedError('Couldn’t find API client');

  try {
    const verified = await verifyPassword(secretKey, apiClient.secret_key_hash);
    if (!verified) {
      throw new UnauthenticatedError('Incorrect client username or secret');
    }
    return await apiClient.getUser();
  } catch (e) {
    if (e.code === 'InvalidArg') {
      throw new UnauthenticatedError(
        `Malformed secret key for API client ${apiClient.username}. Must be in PHC String Format.`,
      );
    }
    throw e;
  }
}
