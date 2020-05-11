/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';
import sinon from 'sinon';

import {
  accessPolicy,
  MEDITRAK_DEVICE_DETAILS,
  verifiedUser,
  refreshToken,
} from './Authenticator.fixtures';
import { getPolicyForUserStub } from './Authenticator.stubs';

export const testAuthenticatePassword = constructAuthenticator => () => {
  it('throws an error with invalid arguments', async () => {
    const authenticator = constructAuthenticator();
    expect(() => authenticator.authenticatePassword()).to.throw;
    const assertThrowsWithArg = async arg =>
      expect(authenticator.authenticatePassword(arg)).to.be.rejectedWith(
        'Please supply emailAddress, password and deviceName',
      );
    await assertThrowsWithArg({});
    await assertThrowsWithArg({
      password: 'validPassword',
      deviceName: 'validDevice',
    }); // no emailAddress
    await assertThrowsWithArg({
      emailAddress: 'verified@test.com',
      deviceName: 'validDevice',
    }); // no password
    await assertThrowsWithArg({
      emailAddress: 'verified@test.com',
      password: 'validPassword',
    }); // no deviceName
  });

  it('throws an error when the credentials are invalid', async () => {
    const authenticator = constructAuthenticator();
    const assertThrowsWithArg = (arg, errorMessage) =>
      expect(authenticator.authenticatePassword(arg)).to.be.rejectedWith(errorMessage);
    await assertThrowsWithArg(
      {
        emailAddress: 'invalid@test.com',
        password: 'validPassword',
        deviceName: 'validDevice',
      },
      'Email address or password not found',
    ); // invalid email
    await assertThrowsWithArg(
      {
        emailAddress: 'verified@test.com',
        password: 'invalidPassword',
        deviceName: 'validDevice',
      },
      'Incorrect email or password',
    ); // invalid password
    await assertThrowsWithArg(
      {
        emailAddress: 'unverified@test.com',
        password: 'validPassword',
        deviceName: 'validDevice',
      },
      'Email address not yet verified',
    ); // unverified email
  });

  it('should succeed when the credentials are correct', async () => {
    const authenticator = constructAuthenticator();

    return expect(
      authenticator.authenticatePassword({
        emailAddress: 'verified@test.com',
        password: 'validPassword',
        deviceName: 'validDevice',
      }),
    ).to.be.fulfilled;
  });

  it('should respond with the expected values when the credentials are correct', async () => {
    const authenticator = constructAuthenticator();
    await expect(
      authenticator.authenticatePassword({
        emailAddress: 'verified@test.com',
        password: 'validPassword',
        deviceName: 'validDevice',
      }),
    ).to.eventually.deep.equal({
      accessPolicy,
      refreshToken,
      user: verifiedUser,
    });
    expect(getPolicyForUserStub).to.have.been.calledOnceWithExactly(verifiedUser.id);
  });

  it('should build the correct access policy for the meditrak device', async () => {
    const authenticator = constructAuthenticator();
    const assertCorrectAccessPolicyWasBuilt = async (meditrakDeviceDetails, useLegacyFormat) => {
      getPolicyForUserStub.resetHistory(); // ensure history is reset between tests
      await expect(
        authenticator.authenticatePassword(
          {
            emailAddress: 'verified@test.com',
            password: 'validPassword',
            deviceName: 'validDevice',
          },
          meditrakDeviceDetails,
        ),
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
    await assertCorrectAccessPolicyWasBuilt(MEDITRAK_DEVICE_DETAILS.modern, false);
    await assertCorrectAccessPolicyWasBuilt(MEDITRAK_DEVICE_DETAILS.ultraModern, false);
    // legacy
    await assertCorrectAccessPolicyWasBuilt(MEDITRAK_DEVICE_DETAILS.legacy, true);
    await assertCorrectAccessPolicyWasBuilt(MEDITRAK_DEVICE_DETAILS.ultraLegacy, true);
  });
};
