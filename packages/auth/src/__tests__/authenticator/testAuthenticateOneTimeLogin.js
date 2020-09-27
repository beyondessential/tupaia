/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { Authenticator } from '../../Authenticator';
import { models, AccessPolicyBuilderStub } from './Authenticator.stubs';
import { verifiedUser, refreshToken, accessPolicy } from './Authenticator.fixtures';

export const testAuthenticateOneTimeLogin = () => {
  const authenticator = new Authenticator(models, AccessPolicyBuilderStub);

  describe.only('throws an error with invalid arguments', () => {
    const testData = [
      ['null argument', [undefined, '']],
      ['empty argument', [{}, 'token not provided']],
      [
        'no token',
        [
          {
            deviceName: 'validDevice',
          },
          'token not provided',
        ],
      ],
      [
        'invalid one time login token',
        [{ token: 'invalidToken', deviceName: 'validDevice' }, 'Error thrown by stub'],
      ],
    ];

    // TODO: Test failure
    it.each(testData)('%s', async (_, [entities, expectedError]) => {
      await expect(authenticator.authenticateOneTimeLogin(entities)).rejects.toThrow(expectedError);

      authenticator.authenticateOneTimeLogin(entities).catch(e => {
        expect(e.message).toEqual(expectedError);
      });
    });
  });

  it('should respond correctly with a valid one time login token', async () => {
    authenticator
      .authenticateOneTimeLogin({ token: 'validToken', deviceName: 'validDevice' })
      .then(r => {
        expect(r).toEqual({
          user: verifiedUser,
          refreshToken,
          accessPolicy,
        });

        expect(models.refreshToken.updateOrCreate).toHaveBeenCalledOnceWith(
          { device: 'validDevice', user_id: verifiedUser.id },
          { token: refreshToken, meditrak_device_id: null },
        );
      });
  });
};
