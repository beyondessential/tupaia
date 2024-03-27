import { createUser } from './handlers/createUser';
import { requestResendEmail, verifyEmail } from './handlers/verifyEmail';
import { requestResetPassword } from './handlers/requestResetPassword';
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

export const appRequestResetPassword = () => async (req, res) => {
  const result = await requestResetPassword(req);
  res.send(result);
};

export const appResendEmail = () => async (req, res) => {
  const result = await requestResendEmail(req);
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
