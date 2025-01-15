import { Authenticator } from '../../Authenticator';
import { models, AccessPolicyBuilderStub } from './Authenticator.stubs';
import { verifiedUser, refreshToken, accessPolicy } from './Authenticator.fixtures';

export const testAuthenticateOneTimeLogin = () => {
  const authenticator = new Authenticator(models, AccessPolicyBuilderStub);
  it('throws an error with invalid arguments', async () => {
    await expect(authenticator.authenticateOneTimeLogin()).toReject();

    const assertThrowsWithArg = async arg => {
      return expect(authenticator.authenticateOneTimeLogin(arg)).toBeRejectedWith(
        'token not provided',
      );
    };
    await assertThrowsWithArg({});
    await assertThrowsWithArg({
      deviceName: 'validDevice',
    }); // no token
  });

  it('should respond correctly with a valid one time login token', async () => {
    await expect(
      authenticator.authenticateOneTimeLogin({ token: 'validToken', deviceName: 'validDevice' }),
    ).resolves.toStrictEqual({
      user: verifiedUser,
      refreshToken,
      accessPolicy,
    });

    expect(models.refreshToken.updateOrCreate).toHaveBeenCalledOnceWith(
      { device: 'validDevice', user_id: verifiedUser.id },
      { token: refreshToken, meditrak_device_id: null },
    );
  });
};
