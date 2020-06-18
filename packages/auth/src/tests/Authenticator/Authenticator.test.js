/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import sinon from 'sinon';
import randomToken from 'rand-token';

import { getPolicyForUserStub, models } from './Authenticator.stubs';
import { refreshToken } from './Authenticator.fixtures';
import { testAuthenticatePassword } from './testAuthenticatePassword';
import { testAuthenticateOneTimeLogin } from './testAuthenticateOneTimeLogin';
import { testAuthenticateRefreshToken } from './testAuthenticateRefreshToken';

describe('Authenticator', () => {
  before(() => {
    sinon.stub(randomToken, 'generate').returns(refreshToken);
  });

  after(() => {
    randomToken.generate.restore();
  });

  afterEach(() => {
    getPolicyForUserStub.resetHistory();
    models.meditrakDevice.updateOrCreate.resetHistory();
    models.refreshToken.updateOrCreate.resetHistory();
  });

  describe('authenticatePassword', testAuthenticatePassword);
  describe('authenticateRefreshToken', testAuthenticateRefreshToken);
  describe('authenticateOneTimeLogin', testAuthenticateOneTimeLogin);
});
