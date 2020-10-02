import { fetchFromMeditrakServerUsingTokens } from '/appServer/requestHelpers';

/*
 * Function will attempt to change a user's password on the TupaiaApp server.
 * Required fields in req.body: 'oldPassword', 'password', 'passwordConfirm'
 */
export const changePassword = async req => {
  const { userName } = req.session.userJson;
  const endpoint = 'me/changePassword';

  return fetchFromMeditrakServerUsingTokens(endpoint, req.body, null, {}, userName);
};
