/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 **/

import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import randomize from 'randomatic';
import { hashPassword } from 'authentication-utilities';

export function generateSecretKey() {
  return randomize('*', 20);
}

/**
 * Helper function to encrypt passwords using sha256
 **/
export function encryptPassword(password, salt) {
  return hashPassword(password, salt);
}

/**
 * Returns an object containing the encrypted form of a password, along with its random salt.
 **/
export function hashAndSaltPassword(password) {
  const salt = crypto.randomBytes(16).toString('base64'); // Generate a random salt
  const encryptedPassword = encryptPassword(password, salt);
  return { password_hash: encryptedPassword, password_salt: salt };
}

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
  return jwt.verify(jwtToken, process.env.JWT_SECRET).refreshToken;
};
