import { createUser } from './handlers/createUser';
import { verifyEmail, requestResendEmail } from './handlers/verifyEmail';
import { changePassword } from './handlers/changePassword';
import { requestResetPassword } from './handlers/requestResetPassword';
import { getCountryAccessList } from './handlers/getCountryAccessList';
import { requestCountryAccess } from './handlers/requestCountryAccess';

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
