/**
 * @typedef {import('@tupaia/types').Country} Country
 * @typedef {import('@tupaia/types').Entity} Entity
 * @typedef {import('@tupaia/types').User} User
 * @typedef {import('@tupaia/types').UserAccount} UserAccount
 * @typedef {import('@tupaia/types').UserAccountPreferences} UserAccountPreferences
 * @typedef {import('../../ModelRegistry').ModelRegistry} ModelRegistry
 * @typedef {import('../Entity').EntityRecord} EntityRecord
 * @typedef {import('../PermissionGroup').PermissionGroupRecord} PermissionGroupRecord
 * @typedef {import('../UserEntityPermission').UserEntityPermissionRecord} UserEntityPermissionRecord
 */

import { verify } from '@node-rs/argon2';
import winston from 'winston';

import { encryptPassword, sha256EncryptPassword, verifyPassword } from '@tupaia/auth';
import {
  API_CLIENT_PERMISSIONS,
  PUBLIC_USER_EMAIL,
  PUBLIC_USER_ID,
  SyncDirections,
  SyncFact,
  USER_PREFERENCES_FIELDS,
} from '@tupaia/constants';
import { ensure } from '@tupaia/tsutils';
import { EntityTypeEnum } from '@tupaia/types';
import { DatabaseError } from '@tupaia/utils';
import { QUERY_CONJUNCTIONS } from '../../BaseDatabase';
import { DatabaseModel } from '../../DatabaseModel';
import { DatabaseRecord } from '../../DatabaseRecord';
import { RECORDS } from '../../records';
import { addRecentEntities } from './addRecentEntities';

const DEFAULT_PAGE_SIZE = 100;

const USERS_EXCLUDED_FROM_LIST = /** @type {const} */ ([
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
]);

const INTERNAL_EMAIL_DOMAINS = /** @type {const} */ ([
  'bes.au',
  'beyondessential.com.au',
  'tupaia.org',
]);

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

  get isPublicUser() {
    return this.id === PUBLIC_USER_ID;
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
   * @returns {Promise<UserEntityPermissionRecord[]>}
   */
  async getEntityPermissions() {
    return await this.otherModels.userEntityPermission.find({ user_id: this.id });
  }

  /**
   * @param {Entity['code'] | undefined} [countryCode]
   * @param {string | undefined} [type] comma-separated list of entity types
   * @returns {Promise<(Entity & { isRecent: true })[]>}
   */
  async getRecentEntities(countryCode, type, options) {
    const entityIds = this.getRecentEntityIds(countryCode, type);
    const entityRecords = await this.otherModels.entity.find({ id: { entityIds } }, options);
    for (const entity of entityRecords) entity.isRecent = true;
    return entityRecords;
  }

  /**
   * @param {Entity['code'] | undefined} [countryCode]
   * @param {string | undefined} [type] comma-separated list of entity types
   * @returns {Entity['id'][]}
   */
  getRecentEntityIds(countryCode, type) {
    if (!countryCode || !type) {
      winston.warn(
        'UserRecord#getRecentEntityIds: missing `countryCode` or `type` argument. Returning empty array.',
        { countryCode, type },
      );
      return [];
    }

    const recentEntityIdsForCountry = this.preferences.recent_entities?.[countryCode];
    if (!recentEntityIdsForCountry) return [];

    const entityTypes = type.split(',');
    return entityTypes.flatMap(entityType => recentEntityIdsForCountry[entityType] ?? []);
  }
}

export class UserModel extends DatabaseModel {
  static syncDirection = SyncDirections.BIDIRECTIONAL;

  get excludedFieldsFromSync() {
    return /** @type {const} */ (['password_hash']);
  }

  /**
   * @param {ModelRegistry} models
   * @param {User['id']} userId
   * @param {Entity['id'][]} entityIds
   * @returns {Promise}
   */
  static async addRecentEntities(models, userId, entityIds) {
    return await addRecentEntities(models, userId, entityIds);
  }

  get DatabaseRecordClass() {
    return UserRecord;
  }

  /**
   * Returns the user that is used for submitting surveys when not logged in
   * @returns {Promise<UserRecord>}
   */
  async findPublicUser(options) {
    return ensure(
      await this.findOne({ email: PUBLIC_USER_EMAIL }, options),
      `Public user not found. There must be a user with email ${PUBLIC_USER_EMAIL}`,
    );
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

  /**
   * @param {User['id'][]} userIds
   * @returns {Promise<{id: User['id'], name: string}[]>}
   */
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

  /**
   * @param {Country['code']} countryCode
   * @param {PermissionGroupRecord} permissionGroup
   * @param {string | undefined} [searchTerm]
   * @returns {Promise<{id: string, name: string}[]>}
   */
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
    /** @type {UserEntityPermissionRecord[]} */
    const userEntityPermissions = await this.otherModels.userEntityPermission.find({
      permission_group_id: permissionGroupWithAncestors.map(p => p.id),
      entity_id: entity.id,
    });

    const userIds = userEntityPermissions.map(uep => uep.user_id);

    return await this.getFilteredUsers(searchTerm, userIds);
  }

  /**
   * @param {User['id']} userId
   */
  async getUpdatedUserPreferenceFields(userId, updatedFields) {
    const updatedUserPreferences = Object.entries(updatedFields).filter(([key]) =>
      USER_PREFERENCES_FIELDS.includes(key),
    );
    // If there are, extract them and save them with the existing user preferences
    if (updatedUserPreferences.length > 0) {
      // Remove user preferences fields from updatedFields so they don't get saved else where
      updatedUserPreferences.forEach(([key]) => {
        delete updatedFields[key];
      });

      /** @type {UserRecord} */
      const userRecord = await this.findById(userId);
      const { preferences = {} } = userRecord;

      /** @type {UserAccountPreferences} */
      const updatedPreferenceFields = updatedUserPreferences.reduce((obj, [key, value]) => {
        obj[key] = value;
        return obj;
      }, preferences);
      // If we change the selected project, we clear out the recent entities
      if (updatedPreferenceFields.project_id) {
        updatedPreferenceFields.recentEntities = {};
      }

      updatedFields = {
        preferences: updatedPreferenceFields,
        ...updatedFields,
      };
    }

    return updatedFields;
  }

  /**
   * @param {User['id']} userId
   * @param {Entity['code'] | undefined} [countryCode]
   * @param {string | undefined} [type] comma-separated list of entity types
   * @returns {Promise<Entity['id'][]>} Entity IDs
   */
  async getRecentEntityIds(userId, countryCode, type) {
    const user = ensure(await this.findById(userId), `No user exists with ID ${userId}`);
    return user.getRecentEntityIds(countryCode, type);
  }

  /**
   * @param {UserAccount} userData
   */
  async transformUserData(userData, project = null, country = null) {
    const {
      id,
      full_name: fullName,
      first_name: firstName,
      last_name: lastName,
      email,
      employer,
      position,
      mobile_number: mobileNumber,
      preferences = {},
      access_policy: accessPolicy,
    } = userData;

    const {
      project_id: projectId,
      country_id: countryId,
      delete_account_requested,
      hide_welcome_screen,
    } = preferences;

    return {
      fullName,
      firstName,
      lastName,
      email,
      id,
      employer,
      position,
      mobileNumber,
      projectId,
      project,
      countryId,
      country,
      deleteAccountRequested: delete_account_requested === true,
      hideWelcomeScreen: hide_welcome_screen === true,
      accessPolicy,
    };
  }

  sanitizeForCentralServer = data => {
    const { password_hash, access_policy, ...rest } = data;
    return rest;
  };

  /**
   * @param {SyncSnapshotAttributes} changes
   * @returns {Promise<SyncSnapshotAttributes>}
   */
  filterSyncForClient = async changes => {
    /** @type {string | null | undefined} */
    const currentUserId = await this.otherModels.localSystemFact.get(SyncFact.CURRENT_USER_ID);
    /** @type {string | null | undefined} */
    const lastSuccessfulSyncPull = await this.otherModels.localSystemFact.get(
      SyncFact.LAST_SUCCESSFUL_SYNC_PULL,
    );

    if (lastSuccessfulSyncPull === undefined || lastSuccessfulSyncPull === '-1') {
      return changes.filter(change => change.data.id !== currentUserId);
    }

    return changes;
  };
}
