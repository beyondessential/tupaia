'use strict';

import { hash } from '@node-rs/argon2';

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

/**
 * Use Argon2 to hash existing SHA-256 hash, replacing standard '$argon2id$' prefix with
 * '$sha256+argon2id$' to track which users have truly migrated to Argon2.
 */
async function flaggedHash(sha256Hash) {
  const argon2Hash = await hash(sha256Hash);
  return argon2Hash.replace('$argon2id$', '$sha256+argon2id$');
}

exports.up = async function (db) {
  async function migrateUserAccounts() {
    const users = await db.runSql('SELECT id, password_hash FROM user_account');
    await Promise.all(
      users.rows.map(async user => {
        const { id, password_hash } = user;
        const migratedHash = await flaggedHash(password_hash);
        await db.runSql('UPDATE user_account SET password_hash = $1 WHERE id = $2', [
          migratedHash,
          id,
        ]);
      }),
    );
  }

  async function migrateApiClients() {
    const apiClients = await db.runSql('SELECT id, secret_key_hash FROM api_client');
    await Promise.all(
      apiClients.rows.map(async apiClient => {
        const { id, secret_key_hash } = apiClient;
        const migratedHash = await flaggedHash(secret_key_hash);
        await db.runSql('UPDATE api_client SET secret_key_hash = $1 WHERE id = $2', [
          migratedHash,
          id,
        ]);
      }),
    );
  }

  await Promise.all([migrateUserAccounts(), migrateApiClients()]);

  // Preserve legacy salt for a given user so we can still authenticate them.
  // Once a user is migrated to Argon2, we set their legacy salt to NULL.
  // @see `@tupaia/database/src/modelClasses/User`
  await db.runSql(`
    ALTER TABLE user_account RENAME COLUMN password_salt TO legacy_password_salt;
    ALTER TABLE user_account ALTER COLUMN legacy_password_salt DROP NOT NULL;
  `);
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
