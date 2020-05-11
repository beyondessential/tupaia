/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';

export const testAuthenticateRefreshToken = constructAuthenticator => async () => {
  it('throws an error with invalid arguments', async () => {
    const authenticator = constructAuthenticator();
    expect(() => authenticator.authenticateRefreshToken()).to.throw;
    const assertThrowsWithArg = async arg =>
      expect(authenticator.authenticateRefreshToken(arg)).to.be.rejectedWith(
        'Please supply refreshToken',
      );
    await assertThrowsWithArg({});
    await assertThrowsWithArg({
      password: 'validPassword',
    }); // no refreshToken
  });

  it('throws an error with an invalid refresh token', async () => {
    const authenticator = constructAuthenticator();
    return expect(
      authenticator.authenticateRefreshToken({ refreshToken: 'invalidToken' }),
    ).to.be.rejectedWith('Refresh token not valid');
  });

  it('throws an error with an expired refresh token', async () => {
    const authenticator = constructAuthenticator();
    return expect(
      authenticator.authenticateRefreshToken({ refreshToken: 'expiredToken' }),
    ).to.be.rejectedWith('Refresh token has expired');
  });

  it('should respond correctly with a valid refresh token', async () => {
    const authenticator = constructAuthenticator();
    return expect(authenticator.authenticateRefreshToken({ refreshToken: 'validToken' })).to.be
      .fulfilled;
  });
};
