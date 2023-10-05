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
  const apiAccessPolicy = new AccessPolicy(await accessPolicyBuilder.getPolicyForUser(apiUser.id));

  // The session accessPolicy is the raw user access policy
  // We need to merge with the api access policy for full access
  req.accessPolicy = req.session
    ? mergeAccessPolicies(req.accessPolicy, apiAccessPolicy)
    : apiAccessPolicy;

  next();
};
