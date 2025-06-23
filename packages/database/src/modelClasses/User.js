import { verify } from '@node-rs/argon2';

import { encryptPassword, sha256EncryptPassword, verifyPassword } from '@tupaia/auth';

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseRecord } from '../DatabaseRecord';
import { RECORDS } from '../records';

export class UserRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.USER_ACCOUNT;

  get fullName() {
    let userFullName = this.first_name;
    if (this.last_name && this.last_name?.length > 0) {
      userFullName += ` ${this.last_name}`;
    }
    return userFullName;
  }

  /**
   * Attempts to verify the password using argon2, if that fails, it tries to verify the password
   * using sha256 plus argon2. If the password is verified using sha256, the password is moved to
   * argon2.
   * @param password {string}
   * @returns {Promise<boolean>}
   */
  async checkPassword(password) {
    const salt = this.password_salt;
    const hash = this.password_hash;

    // Try to verify password using argon2 directly
    const isVerified = await verifyPassword(password, this.password_hash);
    if (isVerified) {
      return true;
    }

    // Try to verify password using sha256 plus argon2
    const hashedUserInput = sha256EncryptPassword(password, salt);
    const isVerifiedSha256 = await verify(hash, hashedUserInput);
    if (isVerifiedSha256) {
      // Move password to argon2
      const encryptedPassword = await encryptPassword(password);
      await this.model.updateById(this.id, { password_hash: encryptedPassword });
      return true;
    }

    return false;
  }

  checkIsEmailUnverified() {
    return this.verified_email === this.model.emailVerifiedStatuses.NEW_USER;
  }

  checkIsEmailVerified() {
    return this.verified_email === this.model.emailVerifiedStatuses.VERIFIED;
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

  customColumnSelectors = {
    full_name: () =>
      `CASE
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
