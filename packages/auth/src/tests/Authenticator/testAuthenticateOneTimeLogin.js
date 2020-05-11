/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';

export const testAuthenticateOneTimeLogin = constructAuthenticator => () => {
  it('throws an error with invalid arguments', async () => {
    const authenticator = constructAuthenticator();
    expect(() => authenticator.authenticateOneTimeLogin()).to.throw;
    const assertThrowsWithArg = arg =>
      expect(authenticator.authenticateOneTimeLogin(arg)).to.be.rejectedWith('token not provided');
    await assertThrowsWithArg({});
    await assertThrowsWithArg({
      deviceName: 'validDevice',
    }); // no token
  });

  it('throws an error with an invalid one time login token', async () => {
    const authenticator = constructAuthenticator();
    return expect(
      authenticator.authenticateOneTimeLogin({ token: 'invalidToken', deviceName: 'validDevice' }),
    ).to.be.rejected;
  });

  it('should respond correctly with a valid one time login token', async () => {
    const authenticator = constructAuthenticator();
    return expect(
      authenticator.authenticateOneTimeLogin({ token: 'validToken', deviceName: 'validDevice' }),
    ).to.be.fulfilled;
  });
};
