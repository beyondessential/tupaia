/** @typedef {`${string}-${string}-${string}-${string}-${string}`} UuidV4 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { customAlphabet } from 'nanoid/non-secure';

const INSTALL_ID_KEY = 'installId';

const HEX_ALPHABET = '0123456789abcdef';
const generateHex = customAlphabet(HEX_ALPHABET, 32);

/**
 * Generate v4 UUID, emulating `AppCenter.getInstallId()`. Historically, install IDs for Android
 * have been lowercase, so doing that here. (Uppercase for iOS. Not sure why, but not important.)
 *
 * Using `nanoid` because:
 * - already a dependency (avoids `uuid` and/or `crypto` polyfill);
 * - no need to be cryptographically secure.
 * @returns {UuidV4}
 */
function uuidV4() {
  const hex = generateHex().split('');
  hex[12] = '4'; // version nibble
  hex[16] = HEX_ALPHABET[(parseInt(hex[16], 16) & 0x3) | 0x8]; // variant nibble (8, 9, a or b)
  const id = hex.join('');
  return `${id.slice(0, 8)}-${id.slice(8, 12)}-${id.slice(12, 16)}-${id.slice(16, 20)}-${id.slice(
    20,
  )}`;
}

/**
 * Cache the in-flight lookup to avoid race condition between concurrent callers.
 * @type {Promise<UuidV4> | null}
 */
let installIdPromise = null;

/** @returns {Promise<UuidV4>} */
const resolveInstallId = async () => {
  const existingInstallId = await AsyncStorage.getItem(INSTALL_ID_KEY);
  if (existingInstallId) return existingInstallId;

  const installId = uuidV4();
  await AsyncStorage.setItem(INSTALL_ID_KEY, installId);
  return installId;
};

/**
 * Returns a stable per-install identifier, persisted in AsyncStorage.
 *
 * This replaces App Center's getInstallId() (App Center has been retired). On first
 * call after upgrade, a new id is generated, so existing installs will be recorded as
 * a new meditrak_device on the server.
 *
 * @returns {Promise<UuidV4>}
 */
export const getInstallId = () => {
  if (!installIdPromise) {
    // Clear the cache on failure so a later call can retry rather than caching a rejection.
    installIdPromise = resolveInstallId().catch(error => {
      installIdPromise = null;
      throw error;
    });
  }
  return installIdPromise;
};
