/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import sinon from 'sinon';
import { Authenticator } from '@tupaia/auth';

export const prepareStubAndAuthenticate = async (app, policy) => {
  sinon.stub(Authenticator.prototype, 'getAccessPolicyForUser').returns(policy);
  await app.authenticate();
};
