/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import jwt from 'jsonwebtoken';
import randomToken from 'rand-token';

import { respond } from '@tupaia/utils';
import { DatabaseError, UnauthenticatedError } from '../errors';

const REFRESH_TOKEN_LENGTH = 40;
const ACCESS_TOKEN_EXPIRY_SECONDS = 15 * 60; // User's access expires every 30 mins
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

  return user;
};

const getRefreshToken = async (models, { userId, deviceName }) => {
  // Generate refresh token and save in db
  const refreshToken = randomToken.generate(REFRESH_TOKEN_LENGTH);

  try {
    await models.refreshToken.updateOrCreate(
      {
        user_id: userId,
        device: deviceName,
      },
      {
        token: refreshToken,
      },
    );
  } catch (error) {
    throw new DatabaseError('storing refresh token', error);
  }

  return refreshToken;
};

const getAuthorizationObject = async ({ refreshToken, user, countryIdentifier }) => {
  // Generate JWT
  const accessToken = jwt.sign(
    {
      userId: user.id,
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
    refreshToken: refreshToken,
    user: {
      id: user.id,
      name: user.fullName,
      email: user.email,
      permissionGroups,
      accessPolicy,
    },
  };
};

const authenticatePassword = async (req, res) => {
  let refreshToken;
  const { models } = req;

  // Get user's email, password, and deviceName from the POST body
  const {
    emailAddress,
    password,
    deviceName,
    devicePlatform,
    installId,
    countryIdentifier,
  } = req.body ? req.body : {};

  try {
    const user = await getAuthenticatedUser(models, { emailAddress, password, deviceName });
    refreshToken = await getRefreshToken(models, { userId: user.id, deviceName });

    const authorizationObject = await getAuthorizationObject({
      refreshToken,
      user,
      countryIdentifier,
    });

    if (installId) {
      await models.installId.createForUser(user.id, installId, devicePlatform);
    }

    respond(res, authorizationObject);
  } catch (error) {
    throw error; // Throw error up
  }
};

const authenticateRefreshToken = async (req, res) => {
  // Declare variables to be filled within specific switch cases
  const { models, body: requestBody } = req;
  const { refreshToken, countryIdentifier } = requestBody;

  if (!refreshToken) {
    throw new UnauthenticatedError('Please supply refreshToken in the POST body');
  }

  // Get the refresh token from the models
  let refreshTokenResult;
  try {
    refreshTokenResult = await models.refreshToken.findOne({ token: refreshToken });
  } catch (error) {
    throw new DatabaseError('finding refresh token', error);
  }

  // If there wasn't a *valid* refresh token, tell the user to log in again
  if (!refreshTokenResult || !refreshTokenResult.user_id || !refreshTokenResult.token) {
    throw new UnauthenticatedError('Refresh token not valid, please log in again');
  }

  // If the refresh token has expired, tell the user to log in again
  if (refreshTokenResult.expiry && refreshTokenResult.expiry < Date.now()) {
    throw new UnauthenticatedError('Refresh token has expired, please log in again');
  }

  // There was a valid refresh token, add permission groups and respond
  const userId = refreshTokenResult.user_id;

  let user;
  try {
    user = await models.user.findById(userId);
  } catch (error) {
    throw new DatabaseError('finding user', error);
  }

  const authorizationObject = await getAuthorizationObject({
    refreshToken,
    user,
    countryIdentifier,
  });

  respond(res, authorizationObject);
};

const authenticateOneTimeLogin = async (req, res) => {
  const { models, body: requestBody } = req;
  const { token, countryIdentifier, deviceName } = requestBody;

  if (!token) {
    throw new UnauthenticatedError('Could not authenticate, token not provided.');
  }

  const foundToken = await models.oneTimeLogin.findValidOneTimeLoginOrFail(token);
  foundToken.use_date = new Date();
  foundToken.save();

  const user = await models.user.findById(foundToken.user_id);
  const refreshToken = await getRefreshToken(models, { userId: user.id, deviceName });

  const authorizationObject = await getAuthorizationObject({
    refreshToken,
    user,
    countryIdentifier,
  });

  respond(res, authorizationObject);
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
  // Get the query parameters, and check whether this is using credentials or a refresh token
  const grantType = req.query.grantType || GRANT_TYPES.PASSWORD;
  switch (grantType) {
    default:
    case GRANT_TYPES.PASSWORD:
      await authenticatePassword(req, res);
      break;

    case GRANT_TYPES.REFRESH_TOKEN:
      await authenticateRefreshToken(req, res);
      break;

    case GRANT_TYPES.ONE_TIME_LOGIN:
      await authenticateOneTimeLogin(req, res);
      break;
  }
}
