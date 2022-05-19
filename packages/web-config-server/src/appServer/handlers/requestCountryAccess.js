import { fetchFromCentralServerUsingTokens } from '/appServer/requestHelpers';

/*
 * Returns an array with all the available countries and the currently
 * logged in user's access to them
 */
export const requestCountryAccess = async req => {
  const { models, body } = req;
  const { userName } = req.userJson;
  const endpoint = 'me/requestCountryAccess';
  return fetchFromCentralServerUsingTokens(models, endpoint, body, null, userName);
};
