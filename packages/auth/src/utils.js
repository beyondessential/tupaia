/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import sha256 from 'sha256';
import crypto from 'crypto';

/**
 * Helper function to encrypt passwords using sha256
 */
export function encryptPassword(password, salt) {
  return sha256(`${password}${salt}`);
}

/**
 * Returns an object containing the encrypted form of a password, along with its random salt.
 */
export function hashAndSaltPassword(password) {
  const salt = crypto.randomBytes(16).toString('base64'); // Generate a random salt
  const encryptedPassword = encryptPassword(password, salt);
  return { password_hash: encryptedPassword, password_salt: salt };
}

/**
 * Checks if the raw password matches the encrypted password hash
 */
export const checkPassword = (password, salt, hash) => {
  return encryptPassword(password, salt) === hash;
};
