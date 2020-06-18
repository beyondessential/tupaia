/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';

import { Authenticator } from '../../Authenticator';
import { models, AccessPolicyBuilderStub } from './Authenticator.stubs';
import { verifiedUser, refreshToken, accessPolicy } from './Authenticator.fixtures';

export const testAuthenticateOneTimeLogin = () => {
  const authenticator = new Authenticator(models, AccessPolicyBuilderStub);

  it('throws an error with invalid arguments', async () => {
    expect(() => authenticator.authenticateOneTimeLogin()).to.throw;
    const assertThrowsWithArg = arg =>
      expect(authenticator.authenticateOneTimeLogin(arg)).to.be.rejectedWith('token not provided');
    await assertThrowsWithArg({});
    await assertThrowsWithArg({
      deviceName: 'validDevice',
    }); // no token
  });

  it('throws an error with an invalid one time login token', async () => {
    return expect(
      authenticator.authenticateOneTimeLogin({ token: 'invalidToken', deviceName: 'validDevice' }),
    ).to.be.rejectedWith('Error thrown by stub');
  });

  it('should respond correctly with a valid one time login token', async () => {
    await expect(
      authenticator.authenticateOneTimeLogin({ token: 'validToken', deviceName: 'validDevice' }),
    ).to.eventually.deep.equal({
      user: verifiedUser,
      refreshToken,
      accessPolicy,
    });
    expect(models.refreshToken.updateOrCreate).to.have.been.calledOnceWithExactly(
      { device: 'validDevice', user_id: verifiedUser.id },
      { token: refreshToken, meditrak_device_id: null },
    );
  });
};
