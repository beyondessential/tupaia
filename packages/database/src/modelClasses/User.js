import { verify } from '@node-rs/argon2';

import { encryptPassword, sha256EncryptPassword, verifyPassword } from '@tupaia/auth';
import { DatabaseError } from '@tupaia/utils';

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseRecord } from '../DatabaseRecord';
import { RECORDS } from '../records';

export class UserRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.USER_ACCOUNT;
  static #legacyHashPrefix = '$sha256+argon2id$';

  /**
   * @returns {string}
   */
  get fullName() {
    return [this.first_name, this.last_name]
      .filter(Boolean)
      .map(str => str.trim())
      .join(' ');
  }

  /**
   * A legacy hash is:
   * - A SHA-256 hash…
   * - …further hashed with Argon2…
   * - …prefixed with `$sha256+argon2id$` instead of `$argon2id$`.
   *
   * @see `@tupaia/database/migrations/20250701000000-argon2-passwords-modifies-schema.js`
   * @returns {boolean}
   */
  get hasLegacyPasswordHash() {
    return this.password_hash.startsWith(UserRecord.#legacyHashPrefix);
  }

  /**
   * If the user account has been migrated to use only Argon2, verifies the password directly using
   * Argon2. Otherwise, uses SHA-256 plus Argon2 (see migration referenced below), then migrates the
   * user to Argon2 upon success.
   *
   * @see `@tupaia/database/migrations/20250701000000-argon2-passwords-modifies-schema.js`
   * @see {@link hasLegacyPasswordHash}
   *
   * @param password {string}
   * @returns {Promise<boolean>}
   */
  async checkPassword(password) {
    if (this.hasLegacyPasswordHash) {
      const hash = this.password_hash.replace(UserRecord.#legacyHashPrefix, '$argon2id$');
      const salt = this.legacy_password_salt;

      const hashedUserInput = sha256EncryptPassword(password, salt);
      const isVerifiedSha256 = await verify(hash, hashedUserInput);

      if (isVerifiedSha256) {
        // Migrate to Argon2
        const argon2Hash = await encryptPassword(password);
        await this.model.updateById(this.id, {
          password_hash: argon2Hash,
          legacy_password_salt: null,
        });
      }

      return isVerifiedSha256;
    }

    try {
      // Verify password using Argon2 directly
      return await verifyPassword(password, this.password_hash);
    } catch (e) {
      if (e.code === 'InvalidArg') {
        throw new DatabaseError(
          `Malformed password hash for user ${this.email}. Must be in PHC String Format.`,
        );
      }
      throw e;
    }
  }

  checkIsEmailUnverified() {
    return this.verified_email === this.model.emailVerifiedStatuses.NEW_USER;
  }

  checkIsEmailVerified() {
    return this.verified_email === this.model.emailVerifiedStatuses.VERIFIED;
  }

  /**
   * @returns {Promise<import('./UserEntityPermission').UserEntityPermissionRecord[]>}
   */
  async getEntityPermissions() {
    return await this.otherModels.userEntityPermission.find({ user_id: this.id });
  }
}

const PUBLIC_USER_EMAIL = 'public@tupaia.org';

export class UserModel extends DatabaseModel {
  get DatabaseRecordClass() {
    return UserRecord;
  }

  /**
   * Returns the user that is used for submitting surveys when not logged in
   * @returns {Promise<null|*>}
   */
  async findPublicUser() {
    const user = await this.findOne({ email: PUBLIC_USER_EMAIL });
    if (!user) {
      throw new Error('Public user not found. There must be a user with email public@tupaia.org');
    }

    return user;
  }

  async isApiClientUser(userId) {
    const [{ exists }] = await this.database.executeSql(
      'SELECT EXISTS (SELECT 1 FROM api_client WHERE user_account_id = ?);',
      userId,
    );
    return exists;
  }

  customColumnSelectors = {
    /**
     * @privateRemarks Ideally, to match {@link UserRecord.fullName}, this would be:
     * ```sql
     * "TRIM(TRIM(COALESCE(first_name, '')) || ' ' || TRIM(COALESCE(last_name, '')))"
     * ```
     * but `TupaiaDatabase.getColSelector` doesn’t support nested functions.
     *
     * TODO: Trim `first_name` and `last_name` in the DB, and update application-level logic to trim
     * when creating a user.
     */
    full_name: () => `CASE
      WHEN first_name IS NULL THEN last_name
      WHEN last_name IS NULL THEN first_name
      ELSE first_name || ' ' || last_name
    END`,
  };

  emailVerifiedStatuses = {
    UNVERIFIED: 'unverified',
    VERIFIED: 'verified',
    NEW_USER: 'new_user',
  };
}
