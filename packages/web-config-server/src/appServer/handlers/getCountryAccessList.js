import { fetchFromMeditrakServerUsingTokens } from '/appServer/requestHelpers';

/*
 * Returns an array with all the available countries and the currently
 * logged in user's access to them
 */
export const getCountryAccessList = async req => {
  const { session, models } = req;
  const userName = session.userJson.userName;
  const endpoint = 'me/countries';
  return fetchFromMeditrakServerUsingTokens(models, endpoint, null, null, userName);
};
