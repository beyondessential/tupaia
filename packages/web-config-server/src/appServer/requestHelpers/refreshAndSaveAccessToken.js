import { TupaiaAppAuthorisationError, TupaiaAppCommunicationError } from '@tupaia/utils';
import { fetchFromMediTrakServer } from '/appServer/requestHelpers';

export const refreshAndSaveAccessToken = async (models, refreshToken, userName) => {
  try {
    const response = await fetchFromMediTrakServer(
      'auth',
      { refreshToken },
      { grantType: 'refresh_token' },
    );
    if (!response.accessToken || !response.refreshToken) {
      throw new TupaiaAppAuthorisationError();
    } else {
      await models.userSession.updateOrCreate({ userName }, { ...response }); // Save tokens for user
      return response.accessToken;
    }
  } catch (error) {
    throw new TupaiaAppCommunicationError(error);
  }
};
