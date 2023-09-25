/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { Authenticator } from '../../Authenticator';
import { models, AccessPolicyBuilderStub, getPolicyForUserStub } from './Authenticator.stubs';
import { accessPolicy, verifiedUser } from './Authenticator.fixtures';

export const testAuthenticateRefreshToken = () => {
  const authenticator = new Authenticator(models, AccessPolicyBuilderStub);

  describe('throws an error with invalid arguments', () => {
    const testData = [
      ['undefined', undefined, "Cannot read property 'refreshToken' of undefined"],
      ['empty', {}, 'Please supply refreshToken'],
      [
        'no fresh token',
        {
          password: 'validPassword',
        },
        'Please supply refreshToken',
      ],
      ['invalid refresh token', { refreshToken: 'invalidToken' }, 'Refresh token not valid'],
      ['expired refresh token', { refreshToken: 'expiredToken' }, 'Refresh token has expired'],
    ];
    it.each(testData)('%s', async (_, input, expectedError) => {
      await expect(authenticator.authenticateRefreshToken(input)).toBeRejectedWith(expectedError);
    });
  });

  it('should respond correctly with a valid refresh token', async () => {
    const refreshToken = 'validToken';
    getPolicyForUserStub.mockClear(); // ensure history is reset between tests
    await expect(authenticator.authenticateRefreshToken({ refreshToken })).resolves.toStrictEqual({
      accessPolicy,
      refreshToken,
      user: verifiedUser,
    });
    expect(getPolicyForUserStub).toHaveBeenCalledOnceWith(verifiedUser.id);
  });
};
