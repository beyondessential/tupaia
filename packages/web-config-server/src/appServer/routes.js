import { setSession } from '/authSession';
import { handleAuthentication } from './handlers/handleAuthentication';
import { createUser } from './handlers/createUser';
import { verifyEmail, requestResendEmail } from './handlers/verifyEmail';
import { changePassword } from './handlers/changePassword';
import { requestResetPassword } from './handlers/requestResetPassword';
import { getCountryAccessList } from './handlers/getCountryAccessList';
import { requestCountryAccess } from './handlers/requestCountryAccess';

// on /login route
export const appLogin = () => async (req, res) => {
  const response = await handleAuthentication(req.body);
  processAuthResponse(response, req, res);
};

export const appOneTimeLogin = () => async (req, res) => {
  const response = await handleAuthentication(req.body, 'one_time_login');
  processAuthResponse(response, req, res);
};

const processAuthResponse = (authResponse, req, res) => {
  if (authResponse) {
    setSession(req, authResponse); // store new session
    authSuccess(req, res);
  } else {
    authFail(req, res);
  }
};

export const appLogout = () => (req, res) => {
  if (req.session && req.session.userJson && req.session.userJson.userName) req.session.reset();
  if (req.lastuser && req.lastuser.userName) req.lastuser.reset();
  res.send({ loggedout: true });
};

const authSuccess = (req, res) => {
  res.send({
    authenticated: true,
    name: req.session.userJson.name,
    defaultOrganisationUnit: req.session.userJson.defaultOrganisationUnit,
    emailVerified: req.session.userJson.verified_email,
  });
};

const authFail = (req, res) => {
  res.sendStatus(401);
};

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
 *
 */
export const appVerifyEmail = () => async (req, res) => {
  const result = await verifyEmail(req);
  res.send(result);
};
