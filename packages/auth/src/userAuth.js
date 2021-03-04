/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import jwt from 'jsonwebtoken';
import { UnauthenticatedError } from '@tupaia/utils';
import { getJwtToken } from './security';

/**
 * Custom authenticator to check user has a valid and current JWT token, i.e. they have previously
 * authenticated as someone with permission to access this resource
 */
export function getUserIDFromToken(authHeader) {
  let jwtToken;

  try {
    jwtToken = getJwtToken(authHeader);
  } catch (error) {
    throw new UnauthenticatedError(error.message);
  }

  let tokenClaims = {};
  try {
    tokenClaims = jwt.verify(jwtToken, process.env.JWT_SECRET);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new UnauthenticatedError('Authorization token has expired, please log in again');
    } else {
      throw error;
    }
  }

  return tokenClaims.userId;
}

export function getUserAndPassFromBasicAuth(authHeader) {
  const usernamePassword = Buffer.from(authHeader.split(' ')[1], 'base64').toString();
  if (!usernamePassword.includes(':')) {
    throw new UnauthenticatedError('Invalid Basic auth credentials');
  }

  // Split on first occurrence because password can contain ':'
  const username = usernamePassword.split(':')[0];
  const password = usernamePassword.substring(username.length + 1, usernamePassword.length);
  return { username, password };
}
