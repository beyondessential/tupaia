import { createUser } from './handlers/createUser';
import { verifyEmail, requestResendEmail } from './handlers/verifyEmail';
import { changePassword } from './handlers/changePassword';
import { requestResetPassword } from './handlers/requestResetPassword';
import { getCountryAccessList } from './handlers/getCountryAccessList';
import { requestCountryAccess } from './handlers/requestCountryAccess';
import { downloadFiles } from './handlers/downloadFiles';

/**
 * /signup
 *
 * Sign a user up then log them in if successful.
 */
export const appSignup = () => async (req, res) => {
  const result = await createUser(req.body);
  res.send(result);
};

/**
 * /changePassword
 *
 * Change a user's password
 */
export const appChangePassword = () => async (req, res) => {
  const result = await changePassword(req);
  res.send(result);
};

export const appRequestResetPassword = () => async (req, res) => {
  const result = await requestResetPassword(req);
  res.send(result);
};

export const appResendEmail = () => async (req, res) => {
  const result = await requestResendEmail(req);
  res.send(result);
};

/**
 * /getCountryAccessList
 *
 * Gets an array of all countries and user's access to them
 */
export const appGetCountryAccessList = () => async (req, res) => {
  const result = await getCountryAccessList(req);
  res.send(result);
};

/**
 * /downloadFiles
 *
 */
export const appDownloadFiles = () => async (req, res) => {
  const result = await downloadFiles(req);
  res.setHeader('content-type', result.headers.get('content-type'));
  res.setHeader('content-disposition', result.headers.get('content-disposition'));
  res.setHeader('content-length', result.headers.get('content-length'));
  result.body.pipe(res);
};

/**
 * /RequestCountryAccess
 *
 * Grant user access to specified countries
 */
export const appRequestCountryAccess = () => async (req, res) => {
  const result = await requestCountryAccess(req);
  res.send(result);
};

/**
 * /VerifyEmail
 *
 * Receives a unique token that was emailed to the user to verify their email address
 */
export const appVerifyEmail = () => async (req, res) => {
  const result = await verifyEmail(req);
  res.send(result);
};
