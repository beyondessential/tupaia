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
  const authHeaderComponents = authHeader.split(' '); // Split between Bearer and the JWT
  if (
    authHeaderComponents[0] !== 'Bearer' ||
    !authHeaderComponents[1] ||
    authHeaderComponents[1].length === 0
  ) {
    throw new Error('Invalid Authorization header, requires Bearer and a JWT token');
  }

  return authHeaderComponents[1];
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
