import { fetchFromCentralServer } from '/appServer/requestHelpers';

/*
 * Issues a password reset request, notifying a user with a one-time-login link.
 */
export const requestResetPassword = async req => {
  const endpoint = 'auth/resetPassword';
  return fetchFromCentralServer(endpoint, req.body);
};
