import { fetchFromMeditrakServerUsingTokens } from '/appServer/requestHelpers';

/*
 * Returns an array with all the available countries and the currently
 * logged in user's access to them
 */
export const getCountryAccessList = async req => {
  const { userName } = req.session.userJson;
  const endpoint = 'me/countries';
  return fetchFromMeditrakServerUsingTokens(endpoint, null, null, {}, userName);
};
