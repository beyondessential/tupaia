/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import sinon from 'sinon';
import randomToken from 'rand-token';

import { Authenticator } from '../../Authenticator';
import { models, AccessPolicyBuilderStub, getPolicyForUserStub } from './Authenticator.stubs';
import { refreshToken } from './Authenticator.fixtures';
import { testAuthenticatePassword } from './testAuthenticatePassword';
import { testAuthenticateOneTimeLogin } from './testAuthenticateOneTimeLogin';
import { testAuthenticateRefreshToken } from './testAuthenticateRefreshToken';

describe('Authenticator', () => {
  const constructAuthenticator = () => new Authenticator(models, AccessPolicyBuilderStub);

  before(() => {
    sinon.stub(randomToken, 'generate').returns(refreshToken);
  });

  after(() => {
    randomToken.generate.restore();
  });

  afterEach(() => {
    getPolicyForUserStub.resetHistory();
  });

  describe('authenticatePassword', testAuthenticatePassword(constructAuthenticator));
  describe('authenticateRefreshToken', testAuthenticateRefreshToken(constructAuthenticator));
  describe('authenticateOneTimeLogin', testAuthenticateOneTimeLogin(constructAuthenticator));
});
