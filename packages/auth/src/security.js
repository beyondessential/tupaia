import jwt from 'jsonwebtoken';
import randomize from 'randomatic';

import { requireEnv } from '@tupaia/utils';

export function generateSecretKey() {
  return randomize('*', 20);
}

/**
 * 'Bearer abcd123' => 'abcd123'
 * @param {string} authHeader
 * @returns {string} token from header
 */
export function getJwtToken(authHeader) {
  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer') {
    throw new MalformedAuthorizationHeaderError(
      `Invalid Authorization header: expected Bearer scheme but got ‘${scheme}’`,
    );
  }
  if (!token) {
    throw new MalformedAuthorizationHeaderError(
      `Invalid Authorization header: missing JSON Web Token`,
    );
  }

  return token;
}

const isJwtToken = authHeader => authHeader.startsWith('Bearer ');

export const extractRefreshTokenFromReq = req => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!isJwtToken(authHeader)) {
    return undefined;
  }

  const jwtToken = getJwtToken(authHeader);
  return jwt.verify(jwtToken, requireEnv('JWT_SECRET')).refreshToken;
};

class MalformedAuthorizationHeaderError extends Error {
  constructor(message) {
    super(message);
    this.name = 'MalformedAuthorizationHeaderError';
  }
}
