/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { Authenticator } from '../../Authenticator';
import { models, AccessPolicyBuilderStub, getPolicyForUserStub } from './Authenticator.stubs';
import { accessPolicy, verifiedUser, refreshToken } from './Authenticator.fixtures';

export const testAuthenticatePassword = () => {
  const authenticator = new Authenticator(models, AccessPolicyBuilderStub);

  describe('throws an error with invalid arguments', () => {
    const testData = [
      ['undefined', undefined, "Cannot read property 'emailAddress' of undefined"],
      ['empty', {}, 'Please supply emailAddress, password and deviceName in the request body'],
      [
        'no emailAddress',

        {
          password: 'validPassword',
          deviceName: 'validDevice',
        },
        'Please supply emailAddress, password and deviceName in the request body',
      ],
      [
        'no password',

        {
          emailAddress: 'verified@test.com',
          deviceName: 'validDevice',
        },
        'Please supply emailAddress, password and deviceName in the request body',
      ],
      [
        'no deviceName',

        {
          emailAddress: 'verified@test.com',
          password: 'validPassword',
        },
        'Please supply emailAddress, password and deviceName in the request body',
      ],
      [
        'invalid email address',

        {
          emailAddress: 'invalid@test.com',
          password: 'validPassword',
          deviceName: 'validDevice',
        },
        'Email address or password not found',
      ],
      [
        'invalid password',

        {
          emailAddress: 'verified@test.com',
          password: 'invalidPassword',
          deviceName: 'validDevice',
        },
        'Incorrect email or password',
      ],
      [
        'unverified email address',

        {
          emailAddress: 'unverified@test.com',
          password: 'validPassword',
          deviceName: 'validDevice',
        },
        'Email address not yet verified',
      ],
    ];

    it.each(testData)('%s', async (_, input, expectedError) => {
      await expect(authenticator.authenticatePassword(input)).toBeRejectedWith(expectedError);
    });
  });

  it('should succeed when the credentials are correct', async () => {
    return expect(
      authenticator.authenticatePassword({
        emailAddress: 'verified@test.com',
        password: 'validPassword',
        deviceName: 'validDevice',
      }),
    ).toResolve();
  });

  it('should respond with the expected values when the credentials are correct', async () => {
    await expect(
      authenticator.authenticatePassword({
        emailAddress: 'verified@test.com',
        password: 'validPassword',
        deviceName: 'validDevice',
      }),
    ).resolves.toStrictEqual({
      accessPolicy,
      refreshToken,
      user: verifiedUser,
    });

    expect(getPolicyForUserStub).toHaveBeenCalledOnceWith(verifiedUser.id);

    expect(models.refreshToken.updateOrCreate).toHaveBeenCalledOnceWith(
      { device: 'validDevice', user_id: verifiedUser.id },
      { token: refreshToken },
    );
  });
};
