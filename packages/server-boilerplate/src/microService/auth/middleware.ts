import { RequestHandler } from 'express';

import { AccessPolicy } from '@tupaia/access-policy';
import { Authenticator, getJwtToken, getUserAndPassFromBasicAuth } from '@tupaia/auth';
import { UserRecord } from '@tupaia/tsmodels';
import { UnauthenticatedError } from '@tupaia/utils';

import { AccessPolicyObject, ServerBoilerplateModelRegistry } from '../../types';

const getBearerAccessPolicy = async (authenticator: Authenticator, authHeader: string) => {
  // Use the user account provided in the auth header if present
  const accessToken = getJwtToken(authHeader);

  return authenticator.authenticateAccessToken(accessToken);
};

const getBasicAccessPolicy = async (
  models: ServerBoilerplateModelRegistry,
  authenticator: Authenticator,
  authHeader: string,
  apiName: string,
) => {
  const { username, password } = getUserAndPassFromBasicAuth(authHeader);

  const apiClient = await models.apiClient.findOne({ username });
  if (apiClient) {
    return await authenticator.authenticateApiClient({
      username,
      secretKey: password,
    });
  }

  // not an api client, attempt to authenticate as a regular user
  const { user, accessPolicy } = await authenticator.authenticatePassword({
    emailAddress: username,
    password,
    deviceName: apiName,
  });
  if (user) {
    return { user, accessPolicy };
  }

  throw new UnauthenticatedError('Could not find user');
};

export const buildBasicBearerAuthMiddleware =
  (apiName: string, authenticator: Authenticator): RequestHandler =>
  async (req, _res, next) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader) {
        throw new UnauthenticatedError(
          'No Authorization header provided. Must use basic or bearer authentication.',
        );
      }

      let userObject: UserRecord;
      let accessPolicyObject: AccessPolicyObject;
      if (authHeader.startsWith('Bearer')) {
        const { user, accessPolicy } = await getBearerAccessPolicy(authenticator, authHeader);
        userObject = user;
        accessPolicyObject = accessPolicy;
      } else if (authHeader.startsWith('Basic')) {
        const { user, accessPolicy } = await getBasicAccessPolicy(
          req.models,
          authenticator,
          authHeader,
          apiName,
        );
        userObject = user;
        accessPolicyObject = accessPolicy;
      } else {
        throw new UnauthenticatedError(
          'Authorization header must use basic or bearer authentication, but got neither',
        );
      }

      req.user = userObject;
      req.accessPolicy = new AccessPolicy(accessPolicyObject);
      next();
    } catch (error) {
      next(error);
    }
  };
