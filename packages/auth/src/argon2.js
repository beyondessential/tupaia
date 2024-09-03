/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import { randomBytes } from 'crypto';
import { hash, verify } from '@node-rs/argon2';
import { encryptPassword as sha256Encrypt } from './utils';

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
  // Try to verify password using argon2 directly
  const isVerified = await verify(hash, `${password}${salt}`);
  if (isVerified) {
    return true;
  }

  // Try to verify password using sha256 plus argon2
  const hashedUserInput = sha256Encrypt(password, salt);

  const isVerifiedSha256 = verify(hash, `${hashedUserInput}${salt}`);
  if (isVerifiedSha256) {
    // Move password to argon2
    console.log('Password was verified using sha256 plus argon2', password);
  }
  return true;
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
