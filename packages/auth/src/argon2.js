/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { randomBytes } from 'crypto';
import { hash, verify } from '@node-rs/argon2';

/**
 * Helper function to encrypt passwords using argon2
 * @param password
 * @param salt
 * @returns {Promise<string>}
 */
export async function encryptPassword(password, salt) {
  return hash(password);
}

/**
 * Helper function to verify passwords using argon2
 * @param password
 * @param salt
 * @param hash
 * @returns {Promise<boolean>}
 */
export async function verifyPassword(password, salt, hash) {
  // Try to verify the password using argon2
  return verify(hash, password);
}

/**
 * Returns an object containing the encrypted form of a password, along with its random salt.
 * @param password
 * @returns {{password_salt: string, password_hash: Promise<string>}}
 */
export async function hashAndSaltPassword(password) {
  const salt = randomBytes(16).toString('base64'); // Generate a random salt
  const encryptedPassword = encryptPassword(password, salt);
  return { password_hash: encryptedPassword, password_salt: salt };
}
