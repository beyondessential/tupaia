/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import { randomBytes } from 'crypto';
import { hash, verify } from '@node-rs/argon2';
import sha256 from 'sha256';

/**
 * Helper function to encrypt passwords using argon2
 * @param password {string}
 * @param salt {string}
 * @returns {Promise<string>}
 */
export function encryptPassword(password, salt) {
  return hash(`${password}${salt}`);
}

/**
 * Helper function to verify passwords using argon2
 * @param password
 * @param salt {string}
 * @param hash {string}
 * @returns {Promise<boolean>}
 */
export async function verifyPassword(password, salt, hash) {
  console.log('Verifying password...');
  return verify(hash, `${password}${salt}`);
}

/**
 * Helper function to hash and salt passwords using argon2
 * @param password {string}
 * @returns {Promise<{password_salt: string, password_hash: string}>}
 */
export async function hashAndSaltPassword(password) {
  const salt = randomBytes(16).toString('base64'); // Generate a random salt
  const encryptedPassword = await encryptPassword(password, salt);
  return { password_hash: encryptedPassword, password_salt: salt };
}

/**
 * Helper function to encrypt passwords using sha256
 * @param password {string}
 * @param salt {string}
 * @returns {string}
 */
export function sha256EncryptPassword(password, salt) {
  return sha256(`${password}${salt}`);
}
