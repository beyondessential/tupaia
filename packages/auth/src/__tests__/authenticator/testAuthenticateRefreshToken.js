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
      ['null', [undefined, "Cannot read property 'emailAddress' of undefined"]],
      ['empty', [{}, 'Please supply refreshToken']],
      [
        'no fresh token',
        [
          {
            password: 'validPassword',
          },
          'Please supply refreshToken',
        ],
      ],
      ['invalid refresh token', [{ refreshToken: 'invalidToken' }, 'Refresh token not valid']],
      ['expired refresh token', [{ refreshToken: 'expiredToken' }, 'Refresh token has expired']],
    ];
    it.each(testData)('%s', (_, [entities, expectedError]) => {
      authenticator.authenticateRefreshToken(entities).catch(e => {
        expect(e).toEqual(expectedError);
      });
    });
  });

  it('should respond correctly with a valid refresh token', async () => {
    return expect(authenticator.authenticateRefreshToken({ refreshToken: 'validToken' })).resolves;
  });

  it('should build the correct access policy for the meditrak device', async () => {
    const assertCorrectAccessPolicyWasBuilt = async (refreshToken, useLegacyFormat) => {
      getPolicyForUserStub.mockReset(); // ensure history is reset between tests
      authenticator.authenticateRefreshToken({ refreshToken }).then(r => {
        expect(r).toStrictEqual({
          accessPolicy,
          refreshToken,
          user: verifiedUser,
        });
        expect(getPolicyForUserStub).toHaveBeenCalledOnceWith(verifiedUser.id, useLegacyFormat);
      });
    };
    // modern
    await assertCorrectAccessPolicyWasBuilt('modern', false);
    await assertCorrectAccessPolicyWasBuilt('ultraModern', false);
    // legacy
    await assertCorrectAccessPolicyWasBuilt('legacy', true);
    await assertCorrectAccessPolicyWasBuilt('ultraLegacy', true);
  });
};
