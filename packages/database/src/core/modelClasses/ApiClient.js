import { verify } from '@node-rs/argon2';

import { encryptPassword, sha256EncryptPassword, verifyPassword } from '@tupaia/auth';
import { DatabaseError, requireEnv } from '@tupaia/utils';
import { SyncDirections } from '@tupaia/constants';

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseRecord } from '../DatabaseRecord';
import { RECORDS } from '../records';

export class ApiClientRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.API_CLIENT;
  static #legacyHashPrefix = '$sha256+argon2id$';

  /**
   * @privateRemarks Environment variable doesn’t exist at init time; could otherwise be static.
   * @deprecated
   */
  #apiClientSalt = requireEnv('API_CLIENT_SALT');

  /**
   * A legacy hash is:
   * - A SHA-256 hash…
   * - …further hashed with Argon2…
   * - …prefixed with `$sha256+argon2id$` instead of `$argon2id$`.
   *
   * @see `@tupaia/database/migrations/20250701000000-argon2-passwords-modifies-schema.js`
   */
  get hasLegacySecretKeyHash() {
    return this.secret_key_hash.startsWith(ApiClientRecord.#legacyHashPrefix);
  }

  /**
   * Attempts authenticating an API client using SHA-256 plus Argon2, then migrates the client to
   * Argon2 upon success.
   *
   * @see `@tupaia/database/migrations/20250701000000-argon2-passwords-modifies-schema.js`
   *
   * @param secretKey {string}
   * @returns {Promise<boolean>} `true` if and only if the client is authenticated and migrated to
   * Argon2.
   */
  async verifySecretKey(secretKey) {
    if (this.hasLegacySecretKeyHash) {
      const hash = this.secret_key_hash.replace(ApiClientRecord.#legacyHashPrefix, '$argon2id$');
      const hashedInput = sha256EncryptPassword(secretKey, this.#apiClientSalt);
      const isVerifiedSha256 = await verify(hash, hashedInput);

      if (isVerifiedSha256) {
        const argon2Hash = await encryptPassword(secretKey);
        await this.model.updateById(this.id, { secret_key_hash: argon2Hash });
      }

      return isVerifiedSha256;
    }

    try {
      return await verifyPassword(secretKey, this.secret_key_hash);
    } catch (e) {
      if (e.code === 'InvalidArg') {
        throw new DatabaseError(
          `Malformed secret key for API client ${this.username}. Must be in PHC String Format.`,
        );
      }
      throw e;
    }
  }

  async getUser() {
    const userId = this.user_account_id;

    // If the api client is not associated with a user, e.g. meditrak api client,
    // the consuming function should auth the user separately
    if (!userId) return null;

    const user = await this.otherModels.user.findOne({ id: userId });
    if (!user) {
      // This isn't an authentication error - the client has provided the correct
      // name and key, but the api client record has an invalid user ID attached!
      throw new DatabaseError('API user does not exist');
    }

    return user;
  }
}

export class ApiClientModel extends DatabaseModel {
  static syncDirection = SyncDirections.DO_NOT_SYNC;

  get DatabaseRecordClass() {
    return ApiClientRecord;
  }
}
