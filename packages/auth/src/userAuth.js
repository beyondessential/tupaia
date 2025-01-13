import jwt from 'jsonwebtoken';
import { UnauthenticatedError } from '@tupaia/utils';
import { getJwtToken } from './security';

const ACCESS_TOKEN_EXPIRY_SECONDS = 15 * 60; // User's access expires every 15 mins

export const constructAccessToken = ({ userId, apiClientUserId }) => {
  if (!userId) {
    throw new Error('Cannot construct accessToken: missing userId');
  }

  const jwtPayload = {
    userId,
  };

  if (apiClientUserId) {
    jwtPayload.apiClientUserId = apiClientUserId;
  }

  // Generate JWT
  return jwt.sign(jwtPayload, process.env.JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY_SECONDS,
  });
};

/**
 * Validate that Bearer Auth Header has valid and current JWT token (accessToken)
 * @param {string} authHeader
 */
export function getTokenClaimsFromBearerAuth(authHeader) {
  let jwtToken;

  try {
    jwtToken = getJwtToken(authHeader);
  } catch (error) {
    throw new UnauthenticatedError(error.message);
  }

  return getTokenClaims(jwtToken);
}

/**
 * Validate that Bearer Auth Header has valid and current JWT token (accessToken)
 * @param {string} accessToken
 * @returns {{userId?: string, refreshToken?: string, apiClientUserId?: string}} Access Token claims
 */
export function getTokenClaims(jwtToken) {
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

  return tokenClaims;
}

export function getUserAndPassFromBasicAuth(authHeader) {
  let usernamePassword;
  try {
    usernamePassword = Buffer.from(authHeader.split(' ')[1], 'base64').toString();
  } catch (error) {
    throw new UnauthenticatedError('Invalid Basic auth credentials');
  }

  if (!usernamePassword.includes(':')) {
    throw new UnauthenticatedError('Invalid Basic auth credentials');
  }

  // Split on first occurrence because password can contain ':'
  const username = usernamePassword.split(':')[0];
  const password = usernamePassword.substring(username.length + 1, usernamePassword.length);
  return { username, password };
}

export const getAuthorizationObject = async ({
  accessPolicy,
  refreshToken,
  user,
  apiClientUser,
  permissionGroups,
}) => {
  const tokenClaims = {
    userId: user.id,
  };

  if (apiClientUser) {
    tokenClaims.apiClientUserId = apiClientUser.id;
  }
  // Generate JWT
  const accessToken = constructAccessToken(tokenClaims);

  // Assemble and return authorization object
  const userDetails = {
    id: user.id,
    name: user.fullName,
    firstName: user.first_name,
    lastName: user.last_name,
    position: user.position,
    employer: user.employer,
    email: user.email,
    profileImage: user.profile_image,
    verifiedEmail: user.verified_email,
    preferences: user.preferences,
    accessPolicy,
  };
  if (permissionGroups) {
    userDetails.permissionGroups = permissionGroups;
  }
  if (apiClientUser) {
    userDetails.apiClient = apiClientUser.email;
  }
  return {
    accessToken,
    refreshToken,
    user: userDetails,
  };
};
