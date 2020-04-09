/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import jwt from 'jsonwebtoken';
import randomToken from 'rand-token';

import { respond, DatabaseError, UnauthenticatedError, UnverifiedError } from '@tupaia/utils';
import { EMAIL_VERIFIED_STATUS } from './verifyEmail';

const REFRESH_TOKEN_LENGTH = 40;
const ACCESS_TOKEN_EXPIRY_SECONDS = 15 * 60; // User's access expires every 15 mins
const GRANT_TYPES = {
  PASSWORD: 'password',
  REFRESH_TOKEN: 'refresh_token',
  ONE_TIME_LOGIN: 'one_time_login',
};

const getAuthenticatedUser = async (models, { emailAddress, password, deviceName }) => {
  if (!emailAddress || !password || !deviceName) {
    throw new UnauthenticatedError(
      'Please supply emailAddress, password and deviceName in the request body',
    );
  }

  // Get the user with the matching email address from the database
  let user;
  try {
    user = await models.user.findOne({
      email: { comparisonValue: emailAddress, ignoreCase: true },
    });
  } catch (error) {
    throw new DatabaseError('finding user', error);
  }

  // If there wasn't a *valid* user with the given email, send back a slightly obscured message
  if (!user || !user.id || !user.password_hash || !user.password_salt) {
    throw new UnauthenticatedError('Email address or password not found');
  }

  // Check password hash matches that in db
  if (!user.checkPassword(password)) {
    throw new UnauthenticatedError('Incorrect email or password');
  }

  if (user.verified_email === EMAIL_VERIFIED_STATUS.NEW_USER) {
    throw new UnverifiedError('Email address not yet verified');
  }
  return user;
};

const upsertRefreshToken = async (models, { userId, deviceName, meditrakDeviceId }) => {
  // Generate refresh token and save in db
  const refreshToken = randomToken.generate(REFRESH_TOKEN_LENGTH);

  try {
    return models.refreshToken.updateOrCreate(
      {
        user_id: userId,
        device: deviceName,
      },
      {
        token: refreshToken,
        meditrak_device_id: meditrakDeviceId,
      },
    );
  } catch (error) {
    throw new DatabaseError('storing refresh token', error);
  }
};

const getAuthorizationObject = async ({ refreshToken, user, countryIdentifier }) => {
  // Generate JWT
  const accessToken = jwt.sign(
    {
      userId: user.id,
      refreshToken: refreshToken.token,
      role: 'Admin', // TODO think about permissions more, how to decide whether user has permission for API resource endpoints
    },
    process.env.JWT_SECRET,
    {
      expiresIn: ACCESS_TOKEN_EXPIRY_SECONDS,
    },
  );

  const permissionGroups = await user.getPermissionGroups(countryIdentifier);
  const accessPolicy = await user.getAccessPolicy();

  // Assemble and return authorization object
  return {
    accessToken: accessToken,
    refreshToken: refreshToken.token,
    user: {
      id: user.id,
      name: user.fullName,
      email: user.email,
      verifiedEmail: user.verified_email,
      permissionGroups,
      accessPolicy: accessPolicy.getSignedJSON(),
    },
  };
};

const saveMeditrakDeviceOnLogin = async (req, userId) => {
  const { body, models, query } = req;
  const { devicePlatform: platform, installId } = body || {};
  const { appVersion } = query;

  return models.meditrakDevice.updateOrCreate(
    { install_id: installId },
    {
      user_id: userId,
      install_id: installId,
      platform,
      app_version: appVersion,
    },
  );
};

const isMeditrakLogin = req => req.body && req.body.installId;

const authenticatePassword = async req => {
  const { body, models } = req;
  // Get user's email, password, and deviceName from the POST body
  const { emailAddress, password, deviceName } = body || {};

  const user = await getAuthenticatedUser(models, { emailAddress, password, deviceName });
  let meditrakDeviceId;
  if (isMeditrakLogin(req)) {
    const meditrakDevice = await saveMeditrakDeviceOnLogin(req, user.id);
    meditrakDeviceId = meditrakDevice.id;
  }
  const refreshToken = await upsertRefreshToken(models, {
    userId: user.id,
    deviceName,
    meditrakDeviceId,
  });

  return { refreshToken, user };
};

const authenticateRefreshToken = async req => {
  // Declare variables to be filled within specific switch cases
  const { models, body: requestBody } = req;
  const { refreshToken: token } = requestBody;

  if (!token) {
    throw new UnauthenticatedError('Please supply refreshToken in the POST body');
  }

  // Get the refresh token from the models
  let refreshToken;
  try {
    refreshToken = await models.refreshToken.findOne({ token });
  } catch (error) {
    throw new DatabaseError('finding refresh token', error);
  }

  // If there wasn't a *valid* refresh token, tell the user to log in again
  if (!refreshToken || !refreshToken.user_id || !refreshToken.token) {
    throw new UnauthenticatedError('Refresh token not valid, please log in again');
  }

  // If the refresh token has expired, tell the user to log in again
  if (refreshToken.expiry && refreshToken.expiry < Date.now()) {
    throw new UnauthenticatedError('Refresh token has expired, please log in again');
  }

  // There was a valid refresh token, add permission groups and respond
  const userId = refreshToken.user_id;

  let user;
  try {
    user = await models.user.findById(userId);
  } catch (error) {
    throw new DatabaseError('finding user', error);
  }

  return { refreshToken, user };
};

const authenticateOneTimeLogin = async req => {
  const { models, body: requestBody } = req;
  const { token, deviceName } = requestBody;

  if (!token) {
    throw new UnauthenticatedError('Could not authenticate, token not provided.');
  }

  const foundToken = await models.oneTimeLogin.findValidOneTimeLoginOrFail(token);
  foundToken.use_date = new Date();
  foundToken.save();

  const user = await models.user.findById(foundToken.user_id);
  const refreshToken = await upsertRefreshToken(models, { userId: user.id, deviceName });

  return { refreshToken, user };
};

const getAuthenticationMethod = grantType => {
  switch (grantType) {
    case GRANT_TYPES.REFRESH_TOKEN:
      return authenticateRefreshToken;
    case GRANT_TYPES.ONE_TIME_LOGIN:
      return authenticateOneTimeLogin;
    case GRANT_TYPES.PASSWORD:
    default:
      return authenticatePassword;
  }
};

/**
 * Handler for a POST to the /auth endpoint
 * By default, or if URL parameters include grantType=password, will check the email address and
 * password supplied in the POST body against a user in the database, and if valid, return JSON
 * including a JWT token that can be used for accessing the API, and a refresh token for when that
 * expires.
 * If URL parameters include grantType=refreshToken, will check the refreshToken against the database
 * and if valid, returns a new JWT token that can be used for accessing the API
 * Override grants to do recursive authentication, for example when creating a new user.
 **/
export async function authenticate(req, res) {
  const { body, query } = req;
  const { grantType = GRANT_TYPES.PASSWORD } = query;
  const authenticationMethod = getAuthenticationMethod(grantType);

  const { refreshToken, user } = await authenticationMethod(req, res);
  const { countryIdentifier } = body || {};
  const authorizationObject = await getAuthorizationObject({
    refreshToken,
    user,
    countryIdentifier,
  });

  respond(res, authorizationObject);
}
