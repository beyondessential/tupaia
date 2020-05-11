/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import sinon from 'sinon';

import { accessPolicy, verifiedUser, unverifiedUser } from './Authenticator.fixtures';

export const getPolicyForUserStub = sinon.stub().resolves(accessPolicy);
export class AccessPolicyBuilderStub {
  getPolicyForUser = getPolicyForUserStub;
}

const findUserStub = ({ email }) => {
  if (!email) return null;
  switch (email.comparisonValue) {
    case 'verified@test.com':
      return verifiedUser;
    case 'unverified@test.com':
      return unverifiedUser;
    default:
      return null;
  }
};

const findRefreshTokenStub = ({ token }) => {
  switch (token) {
    case 'validToken':
      return { token, meditrakDevice: () => null, expiry: Date.now() + 100000 };
    case 'expiredToken':
      return { token, meditrakDevice: () => null, expiry: Date.now() - 100 };
    default:
      return null;
  }
};

const createUpsertStub = () =>
  sinon.stub().callsFake(async (criteria, upsertedFields) => ({ ...criteria, ...upsertedFields }));
export const models = {
  user: {
    findOne: findUserStub,
    findById: () => verifiedUser,
  },
  refreshToken: {
    updateOrCreate: createUpsertStub(),
    findOne: findRefreshTokenStub,
  },
  meditrakDevice: {
    updateOrCreate: createUpsertStub(),
  },
  oneTimeLogin: {
    findValidOneTimeLoginOrFail: token => {
      if (token !== 'validToken') {
        throw new Error();
      }
      return { save: () => {} };
    },
  },
};
