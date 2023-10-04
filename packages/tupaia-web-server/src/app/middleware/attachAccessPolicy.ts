/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { RequestHandler } from 'express';
import { AccessPolicyBuilder } from '@tupaia/auth';
import { AccessPolicy } from '@tupaia/access-policy';

const { API_CLIENT_NAME } = process.env;

export const attachAccessPolicy: RequestHandler = async (req, res, next) => {
  if (req.session) {
    req.accessPolicy = req.session.accessPolicy;
  } else {
    const accessPolicyBuilder = new AccessPolicyBuilder(req.models);
    const apiUser = await req.models.user.findOne({ email: API_CLIENT_NAME });
    if (!apiUser) {
      throw new Error('API Client not found');
    }
    req.accessPolicy = new AccessPolicy(await accessPolicyBuilder.getPolicyForUser(apiUser.id));
  }

  next();
};
