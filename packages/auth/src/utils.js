/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import sha256 from 'sha256';
import crypto from 'crypto';

// Superseded by argon2.js/
export function encryptPassword(password, salt) {
  return sha256(`${password}${salt}`);
}

// Superseded by argon2.js/
export function hashAndSaltPassword(password) {
  const salt = crypto.randomBytes(16).toString('base64'); // Generate a random salt
  const encryptedPassword = encryptPassword(password, salt);
  return { password_hash: encryptedPassword, password_salt: salt };
}
