import { fetchFromMediTrakServer } from '/appServer/requestHelpers';
import { UserSession } from '/models';
import { TupaiaAppAuthorisationError, TupaiaAppCommunicationError } from '/errors';

export const refreshAccessToken = async (refreshToken, userName) => {
  try {
    const response = await fetchFromMediTrakServer(
      'auth',
      { refreshToken },
      { grantType: 'refresh_token' },
    );
    if (!response.accessToken || !response.refreshToken) {
      throw new TupaiaAppAuthorisationError();
    } else {
      await UserSession.updateOrCreate({ userName }, { ...response }); // Save tokens for user
      return response.accessToken;
    }
  } catch (error) {
    throw new TupaiaAppCommunicationError(error);
  }
};
