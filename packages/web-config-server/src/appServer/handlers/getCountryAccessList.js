import { fetchFromMeditrakServerUsingTokens } from '/appServer/requestHelpers';

/*
 * Returns an array with all the available countries and the currently
 * logged in user's access to them
 */
export const getCountryAccessList = async req => {
  const { models } = req;
  const { userName } = req.userJson;
  const endpoint = 'me/countries';
  return fetchFromMeditrakServerUsingTokens(models, endpoint, null, null, userName);
};
