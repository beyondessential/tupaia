import { fetchFromMeditrakServerUsingTokens } from '/appServer/requestHelpers';

/*
 * Function will attempt to change a user's password on the TupaiaApp server.
 * Required fields in req.body: 'oldPassword', 'password', 'passwordConfirm'
 */
export const changePassword = async req => {
  const { session, models, body } = req;
  const { userName } = session.userJson;
  const endpoint = 'me/changePassword';

  return fetchFromMeditrakServerUsingTokens(models, endpoint, body, null, userName);
};
