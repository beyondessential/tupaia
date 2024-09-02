/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

const argon2 = require('argon2');

/**
 * Helper function to encrypt passwords using sha256
 */
export function encryptPassword(password) {
  return argon2.hashAndSaltPassword(password);
}

/**
 * Returns an object containing the encrypted form of a password, along with its random salt.
 */
export function hashAndSaltPassword(password) {
  const salt = crypto.randomBytes(16).toString('base64'); // Generate a random salt
  const encryptedPassword = encryptPassword(password, salt);
  return { password_hash: encryptedPassword, password_salt: salt };
}
