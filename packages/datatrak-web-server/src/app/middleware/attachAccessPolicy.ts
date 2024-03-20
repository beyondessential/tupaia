/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { RequestHandler } from 'express';
import { AccessPolicyBuilder, mergeAccessPolicies } from '@tupaia/auth';
import { AccessPolicy } from '@tupaia/access-policy';

const { API_CLIENT_NAME } = process.env;

export const attachAccessPolicy: RequestHandler = async (req, res, next) => {
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
