/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';

import { Authenticator } from '../../Authenticator';
import { models, AccessPolicyBuilderStub, getPolicyForUserStub } from './Authenticator.stubs';
import { accessPolicy, verifiedUser } from './Authenticator.fixtures';

export const testAuthenticateRefreshToken = () => {
  const authenticator = new Authenticator(models, AccessPolicyBuilderStub);

  it('throws an error with invalid arguments', async () => {
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
    return expect(
      authenticator.authenticateRefreshToken({ refreshToken: 'invalidToken' }),
    ).to.be.rejectedWith('Refresh token not valid');
  });

  it('throws an error with an expired refresh token', async () => {
    return expect(
      authenticator.authenticateRefreshToken({ refreshToken: 'expiredToken' }),
    ).to.be.rejectedWith('Refresh token has expired');
  });

  it('should respond correctly with a valid refresh token', async () => {
    return expect(authenticator.authenticateRefreshToken({ refreshToken: 'validToken' })).to.be
      .fulfilled;
  });

  it('should build the correct access policy for the meditrak device', async () => {
    const assertCorrectAccessPolicyWasBuilt = async (refreshToken, useLegacyFormat) => {
      getPolicyForUserStub.resetHistory(); // ensure history is reset between tests
      await expect(
        authenticator.authenticateRefreshToken({ refreshToken }),
      ).to.eventually.deep.equal({
        accessPolicy,
        refreshToken,
        user: verifiedUser,
      });
      expect(getPolicyForUserStub).to.have.been.calledOnceWithExactly(
        verifiedUser.id,
        useLegacyFormat,
      );
    };
    // modern
    await assertCorrectAccessPolicyWasBuilt('modern', false);
    await assertCorrectAccessPolicyWasBuilt('ultraModern', false);
    // legacy
    await assertCorrectAccessPolicyWasBuilt('legacy', true);
    await assertCorrectAccessPolicyWasBuilt('ultraLegacy', true);
  });
};
