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
  await db.runSql(`
    ALTER TABLE user_account RENAME COLUMN password_hash TO password_hash_old;
    ALTER TABLE user_account ADD COLUMN password_hash TEXT;

    ALTER TABLE api_client RENAME COLUMN secret_key_hash TO secret_key_hash_old;
    ALTER TABLE api_client ADD COLUMN secret_key_hash TEXT;
  `);

  async function migrateUserAccounts() {
    const users = await db.runSql('SELECT id, password_hash_old FROM user_account');
    await Promise.all(
      users.rows.map(async user => {
        const { id, password_hash_old } = user;
        const migratedHash = await flaggedHash(password_hash_old);
        await db.runSql('UPDATE user_account SET password_hash = $1 WHERE id = $2', [
          migratedHash,
          id,
        ]);
      }),
    );
  }

  async function migrateApiClients() {
    const apiClients = await db.runSql('SELECT id, secret_key_hash_old FROM api_client');
    await Promise.all(
      apiClients.rows.map(async apiClient => {
        const { id, secret_key_hash_old } = apiClient;
        const migratedHash = await flaggedHash(secret_key_hash_old);
        await db.runSql('UPDATE api_client SET secret_key_hash = $1 WHERE id = $2', [
          migratedHash,
          id,
        ]);
      }),
    );
  }

  await migrateUserAccounts();
  await migrateApiClients();

  await db.runSql(`
    ALTER TABLE user_account ALTER COLUMN password_hash SET NOT NULL;
    ALTER TABLE user_account DROP COLUMN password_hash_old;

    -- Preserve legacy salt for a given user until they are migrated to Argon2
    ALTER TABLE user_account RENAME COLUMN password_salt TO legacy_password_salt;
    ALTER TABLE user_account ALTER COLUMN legacy_password_salt DROP NOT NULL;

    ALTER TABLE api_client ALTER COLUMN secret_key_hash SET NOT NULL;
    ALTER TABLE api_client DROP COLUMN secret_key_hash_old;
  `);
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
