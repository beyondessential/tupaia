import { fetchFromMeditrakServerUsingTokens } from '/appServer/requestHelpers';

/*
 * Returns an array with all the available countries and the currently
 * logged in user's access to them
 */
export const requestCountryAccess = async req => {
  const { session, models, body } = req;
  const { userName } = session.userJson;
  const endpoint = 'me/requestCountryAccess';
  return fetchFromMeditrakServerUsingTokens(models, endpoint, body, null, userName);
};
