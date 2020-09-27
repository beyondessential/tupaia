/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { Authenticator } from '../../Authenticator';
import { models, AccessPolicyBuilderStub, getPolicyForUserStub } from './Authenticator.stubs';
import {
  accessPolicy,
  MEDITRAK_DEVICE_DETAILS,
  verifiedUser,
  refreshToken,
} from './Authenticator.fixtures';

export const testAuthenticatePassword = () => {
  const authenticator = new Authenticator(models, AccessPolicyBuilderStub);

  describe('throws an error with invalid arguments', () => {
    const testData = [
      ['null', [{}, 'Please supply emailAddress, password and deviceName in the request body']],
      [
        'no emailAddress',
        [
          {
            password: 'validPassword',
            deviceName: 'validDevice',
          },
          'Please supply emailAddress, password and deviceName in the request body',
        ],
      ],
      [
        'no password',
        [
          {
            emailAddress: 'verified@test.com',
            deviceName: 'validDevice',
          },
          'Please supply emailAddress, password and deviceName in the request body',
        ],
      ],
      [
        'no deviceName',
        [
          {
            emailAddress: 'verified@test.com',
            password: 'validPassword',
          },
          'Please supply emailAddress, password and deviceName in the request body',
        ],
      ],
      [
        'invalid email address',
        [
          {
            emailAddress: 'invalid@test.com',
            password: 'validPassword',
            deviceName: 'validDevice',
          },
          'Email address or password not found',
        ],
      ],
      [
        'invalid password',
        [
          {
            emailAddress: 'verified@test.com',
            password: 'invalidPassword',
            deviceName: 'validDevice',
          },
          'Incorrect email or password',
        ],
      ],
      [
        'unverified email address',
        [
          {
            emailAddress: 'unverified@test.com',
            password: 'validPassword',
            deviceName: 'validDevice',
          },
          'Email address not yet verified',
        ],
      ],
    ];

    it.each(testData)('%s', async (_, [arg, expectedError]) => {
      await authenticator
        .authenticatePassword(arg)
        .catch(e => expect(e.message).toBe(expectedError));
    });
  });

  it('should succeed when the credentials are correct', async () => {
    return expect(
      authenticator.authenticatePassword({
        emailAddress: 'verified@test.com',
        password: 'validPassword',
        deviceName: 'validDevice',
      }),
    ).resolves;
  });

  it('should respond with the expected values when the credentials are correct', async () => {
    authenticator
      .authenticatePassword({
        emailAddress: 'verified@test.com',
        password: 'validPassword',
        deviceName: 'validDevice',
      })
      .then(r => {
        expect(r).toEqual({
          accessPolicy,
          refreshToken,
          user: verifiedUser,
        });

        expect(getPolicyForUserStub).toHaveBeenCalledOnceWith(verifiedUser.id);

        expect(models.refreshToken.updateOrCreate).toHaveBeenCalledOnceWith(
          { device: 'validDevice', user_id: verifiedUser.id },
          { token: refreshToken, meditrak_device_id: null },
        );
      });
  });

  it('should build the correct access policy for the meditrak device', async () => {
    const assertCorrectAccessPolicyWasBuilt = async (meditrakDeviceDetails, useLegacyFormat) => {
      // ensure history is reset between tests
      getPolicyForUserStub.mockReset();
      models.meditrakDevice.updateOrCreate.mockReset();
      models.refreshToken.updateOrCreate.mockReset();
      authenticator
        .authenticatePassword(
          {
            emailAddress: 'verified@test.com',
            password: 'validPassword',
            deviceName: 'validDevice',
          },
          meditrakDeviceDetails,
        )
        .then(r => {
          expect(r).toStrictEqual({
            accessPolicy,
            refreshToken,
            user: verifiedUser,
          });

          expect(getPolicyForUserStub).toHaveBeenCalledOnceWith(verifiedUser.id, useLegacyFormat);

          expect(models.meditrakDevice.updateOrCreate).toHaveBeenCalledOnceWith(
            {
              install_id: meditrakDeviceDetails.installId,
            },
            {
              user_id: verifiedUser.id,
              app_version: meditrakDeviceDetails.appVersion,
              platform: meditrakDeviceDetails.platform,
            },
          );

          expect(models.refreshToken.updateOrCreate).toHaveBeenCalledOnceWith(
            {
              device: 'validDevice',
              user_id: verifiedUser.id,
            },
            {
              token: refreshToken,
              meditrak_device_id: meditrakDeviceDetails.appVersion,
            },
          );
        });
    };
    // modern
    await assertCorrectAccessPolicyWasBuilt(MEDITRAK_DEVICE_DETAILS.modern, false);
    await assertCorrectAccessPolicyWasBuilt(MEDITRAK_DEVICE_DETAILS.ultraModern, false);
    // legacy
    await assertCorrectAccessPolicyWasBuilt(MEDITRAK_DEVICE_DETAILS.legacy, true);
    await assertCorrectAccessPolicyWasBuilt(MEDITRAK_DEVICE_DETAILS.ultraLegacy, true);
  });
};
