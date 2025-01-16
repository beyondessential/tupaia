import {
  accessPolicy,
  verifiedUser,
  unverifiedUser,
  MEDITRAK_DEVICE_BY_REFRESH_TOKEN,
} from './Authenticator.fixtures';

export const getPolicyForUserStub = jest.fn().mockResolvedValue(accessPolicy);

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

const getValidToken = token => ({ token, meditrakDevice: () => null, expiry: Date.now() + 100000 });
const findRefreshTokenStub = ({ token }) => {
  if (MEDITRAK_DEVICE_BY_REFRESH_TOKEN[token]) {
    return {
      ...getValidToken(token),
      meditrakDevice: () => MEDITRAK_DEVICE_BY_REFRESH_TOKEN[token],
    };
  }
  switch (token) {
    case 'validToken':
      return getValidToken(token);
    case 'expiredToken':
      return { ...getValidToken(token), expiry: Date.now() - 100 };
    default:
      return null;
  }
};

const createUpsertStub = idField =>
  jest.fn(async (criteria, upsertedFields) => ({
    ...criteria,
    ...upsertedFields,
    id: upsertedFields[idField],
  }));

export const models = {
  user: {
    findOne: findUserStub,
    findById: () => verifiedUser,
  },
  refreshToken: {
    updateOrCreate: createUpsertStub('token'),
    findOne: findRefreshTokenStub,
  },
  meditrakDevice: {
    updateOrCreate: createUpsertStub('app_version'),
  },
  oneTimeLogin: {
    findValidOneTimeLoginOrFail: token => {
      if (token !== 'validToken') {
        throw new Error('Error thrown by stub');
      }
      return { save: () => {} };
    },
  },
};
