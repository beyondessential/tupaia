/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import jwt from 'jsonwebtoken';
import { respond } from '@tupaia/utils';

const GRANT_TYPES = {
  PASSWORD: 'password',
  REFRESH_TOKEN: 'refresh_token',
  ONE_TIME_LOGIN: 'one_time_login',
};
const ACCESS_TOKEN_EXPIRY_SECONDS = 15 * 60; // User's access expires every 15 mins

const getAuthorizationObject = async ({ accessPolicy, refreshToken, user }) => {
  // Generate JWT
  const accessToken = jwt.sign(
    {
      userId: user.id,
      refreshToken,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: ACCESS_TOKEN_EXPIRY_SECONDS,
    },
  );

  // Assemble and return authorization object
  return {
    accessToken: accessToken,
    refreshToken,
    user: {
      id: user.id,
      name: user.fullName,
      email: user.email,
      verifiedEmail: user.verified_email,
      accessPolicy,
    },
  };
};

const isMeditrakLogin = body => body && body.installId;
const getMeditrakDeviceDetails = req => {
  const { body, query } = req;
  if (!isMeditrakLogin(body)) {
    return null;
  }
  const { devicePlatform: platform, installId } = body || {};
  const { appVersion } = query;

  return {
    installId,
    platform,
    appVersion,
  };
};

const checkAuthentication = async req => {
  const { body, query, authenticator } = req;
  switch (query.grantType) {
    case GRANT_TYPES.REFRESH_TOKEN:
      return authenticator.authenticateRefreshToken(body);
    case GRANT_TYPES.ONE_TIME_LOGIN:
      return authenticator.authenticateOneTimeLogin(body);
    case GRANT_TYPES.PASSWORD:
    default: {
      const meditrakDeviceDetails = getMeditrakDeviceDetails(req);
      return authenticator.authenticatePassword(body, meditrakDeviceDetails);
    }
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
  const { refreshToken, user, accessPolicy } = await checkAuthentication(req);
  const { countryIdentifier } = req.body || {};
  const authorizationObject = await getAuthorizationObject({
    refreshToken,
    user,
    countryIdentifier,
    accessPolicy,
  });

  respond(res, authorizationObject);
}
