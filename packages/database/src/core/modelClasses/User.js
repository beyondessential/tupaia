import { verify } from '@node-rs/argon2';

import { encryptPassword, sha256EncryptPassword, verifyPassword } from '@tupaia/auth';
import { DatabaseError } from '@tupaia/utils';
import { SyncDirections, API_CLIENT_PERMISSIONS } from '@tupaia/constants';

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseRecord } from '../DatabaseRecord';
import { RECORDS } from '../records';
import { QUERY_CONJUNCTIONS } from '../BaseDatabase';
import { EntityTypeEnum } from '@tupaia/types';

const DEFAULT_PAGE_SIZE = 100;

const USERS_EXCLUDED_FROM_LIST = [
  'edmofro@gmail.com', // Edwin
  'kahlinda.mahoney@gmail.com', // Kahlinda
  'lparish1980@gmail.com', // Lewis
  'sus.lake@gmail.com', // Susie
  'michaelnunan@hotmail.com', // Michael
  'vanbeekandrew@gmail.com', // Andrew
  'gerardckelly@gmail.com', // Gerry K
  'geoffreyfisher@hotmail.com', // Geoff F
  'josh@sussol.net', // mSupply API Client
  'unicef.laos.edu@gmail.com', // Laos Schools Data Collector
  'tamanu-server@tupaia.org', // Tamanu Server
  'public@tupaia.org', // Public User
];

const INTERNAL_EMAIL_DOMAINS = ['tupaia.org', 'bes.au', 'beyondessential.com.au'];

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
  static syncDirection = SyncDirections.PULL_FROM_CENTRAL;

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

  async buildSyncLookupQueryDetails() {
    return null;
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

  async getFilteredUsers(searchTerm, userIds) {
    const usersFilter = {
      email: {
        comparator: 'not in',
        comparisonValue: USERS_EXCLUDED_FROM_LIST,
      },
      [QUERY_CONJUNCTIONS.RAW]: {
        // exclude E2E users and any internal users
        sql: `(${INTERNAL_EMAIL_DOMAINS.map(domain => `email NOT ILIKE '%@${domain}'`).join(' AND ')})`,
      },
    };

    if (userIds) {
      usersFilter.id = userIds;
    }

    if (searchTerm) {
      usersFilter.full_name = { comparator: 'ilike', comparisonValue: `${searchTerm}%` };
    }

    const users = await this.find(usersFilter);

    // manually sort the users by full name, so that names beginning with special characters are first to match Meditrak
    return users
      .sort((a, b) =>
        a.full_name.toLocaleUpperCase().localeCompare(b.full_name.toLocaleUpperCase()),
      )
      .slice(0, DEFAULT_PAGE_SIZE)
      .map(user => ({
        id: user.id,
        name: user.full_name,
      }));
  }

  async getFilteredUsersForPermissionGroup(countryCode, permissionGroup, searchTerm) {
    // if the permission group is a public permission group that every user has access to because of the api client permissions, then everyone has access to the survey, so return all non-internal users
    if (
      API_CLIENT_PERMISSIONS.find(
        ({ entityCode, permissionGroupName }) =>
          entityCode === countryCode && permissionGroupName === permissionGroup.name,
      )
    ) {
      return await this.getFilteredUsers(searchTerm);
    }

    // get the ancestors of the permission group
    const [permissionGroupWithAncestors, entity] = await Promise.all([
      permissionGroup.getAncestors(),
      this.otherModels.entity.findOne({
        country_code: countryCode,
        type: EntityTypeEnum.country,
      }),
    ]);

    // get the user entity permissions for the permission group and its ancestors
    const userEntityPermissions = await this.otherModels.userEntityPermission.find({
      permission_group_id: permissionGroupWithAncestors.map(p => p.id),
      entity_id: entity.id,
    });

    const userIds = userEntityPermissions.map(uep => uep.user_id);

    return await this.getFilteredUsers(searchTerm, userIds);
  }

  /**
   * @param {string} userId
   * @param {string|undefined} countryCode
   * @param {string|undefined} type
   * @returns {Promise<string[]>} Entity IDs
   */
  async getRecentEntities(userId, countryCode, type) {
    const user = await this.findById(userId);
    const { recent_entities: userRecentEntities } = user.preferences;
    if (!userRecentEntities || !countryCode || !type) {
      return [];
    }

    const recentEntitiesForCountry = userRecentEntities[countryCode];
    if (!recentEntitiesForCountry) {
      return [];
    }

    const entityTypes = type.split(',');
    const recentEntitiesOfTypes = entityTypes.flatMap(
      entityType => recentEntitiesForCountry[entityType] ?? [],
    );

    return recentEntitiesOfTypes;
  }
}
