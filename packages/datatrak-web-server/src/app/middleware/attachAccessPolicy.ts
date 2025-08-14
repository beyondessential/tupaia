import { RequestHandler } from 'express';
import { AccessPolicyBuilder, mergeAccessPolicies } from '@tupaia/auth';
import { AccessPolicy } from '@tupaia/access-policy';
import { requireEnv } from '@tupaia/utils';

export const attachAccessPolicy: RequestHandler = async (req, _res, next) => {
  const API_CLIENT_NAME = requireEnv('API_CLIENT_NAME');
  const accessPolicyBuilder = new AccessPolicyBuilder(req.models);
  const apiUser = await req.models.user.findOne({ email: API_CLIENT_NAME });
  if (!apiUser) {
    throw new Error('API Client not found');
  }
  const apiAccessPolicy = await accessPolicyBuilder.getPolicyForUser(apiUser.id);

  // If we have a session, merge it with the api user
  // Otherwise just use the api user policy
  req.accessPolicy = new AccessPolicy(
    req.session
      ? mergeAccessPolicies(req.session.accessPolicy.policy, apiAccessPolicy)
      : apiAccessPolicy,
  );

  next();
};
