import { fetchFromCentralServer } from '/appServer/requestHelpers';

/*
 * Function will attempt to change a user's password on the TupaiaApp server.
 *
 */
export const verifyEmail = async req => {
  const endpoint = 'auth/verifyEmail';
  const token = req.query.emailToken;
  const response = await fetchFromCentralServer(endpoint, { token });
  if (response.emailVerified === 'true') return response;

  throw Error('Email was not correctly verified');
};

export const requestResendEmail = async req => {
  const endpoint = 'auth/resendEmail';
  return fetchFromCentralServer(endpoint, req.body);
};
