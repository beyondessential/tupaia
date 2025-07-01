import { hash, verify } from '@node-rs/argon2';
import sha256 from 'sha256';

/**
 * Helper function to encrypt passwords using argon2
 * @param password {string}
 * @returns {Promise<string>}
 */
export function encryptPassword(password) {
  return hash(password);
}

/**
 * Helper function to verify passwords using argon2
 * @param password
 * @param hash {string}
 * @returns {Promise<boolean>}
 */
export async function verifyPassword(password, hash) {
  return verify(hash, password);
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
