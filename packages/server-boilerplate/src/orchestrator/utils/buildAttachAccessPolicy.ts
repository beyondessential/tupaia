import { RequestHandler } from 'express';
import { AccessPolicy } from '@tupaia/access-policy';
import { AccessPolicyBuilder, mergeAccessPolicies } from '@tupaia/auth';
import { requireEnv } from '@tupaia/utils';
import { ServerBoilerplateModelRegistry } from '../../types';

const fetchApiClientUserId = async (models: ServerBoilerplateModelRegistry) => {
  const API_CLIENT_NAME = requireEnv('API_CLIENT_NAME');

  const apiUser = await models.user.findOne({ email: API_CLIENT_NAME });
  if (!apiUser) {
    throw new Error('API Client not found');
  }
  return apiUser.id;
};

export const buildAttachAccessPolicy = (
  accessPolicyBuilder: AccessPolicyBuilder,
): RequestHandler => {
  // The api client user is static per deployment, so look it up once and share the result across
  // requests rather than querying the db on every request
  let apiClientUserIdPromise: Promise<string> | null = null;
  const getApiClientUserId = (models: ServerBoilerplateModelRegistry) => {
    if (!apiClientUserIdPromise) {
      apiClientUserIdPromise = fetchApiClientUserId(models);
      apiClientUserIdPromise.catch(() => {
        apiClientUserIdPromise = null; // don't cache failures
      });
    }
    return apiClientUserIdPromise;
  };

  return async (req, _res, next) => {
    const apiUserId = await getApiClientUserId(req.models);
    const apiAccessPolicy = await accessPolicyBuilder.getPolicyForUser(apiUserId);

    // If we have a session, merge it with the api user
    // Otherwise just use the api user policy
    req.accessPolicy = new AccessPolicy(
      req.session
        ? mergeAccessPolicies(req.session.accessPolicy.policy, apiAccessPolicy)
        : apiAccessPolicy,
    );

    next();
  };
};
