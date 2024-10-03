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

exports.up = async function (db) {
  await db.runSql(`
    ALTER TABLE user_account
    RENAME COLUMN password_hash TO password_hash_old;
    ALTER TABLE user_account ALTER COLUMN password_hash_old DROP NOT NULL;
    ALTER TABLE user_account ALTER COLUMN password_salt DROP NOT NULL;

    ALTER TABLE user_account
    ADD COLUMN password_hash TEXT;
  `);
  const users = await db.runSql('SELECT id, password_hash_old FROM user_account');

  await Promise.all(
    users.rows.map(async user => {
      const { id, password_hash_old } = user;
      const hashedValue = await hash(password_hash_old);
      await db.runSql('UPDATE user_account SET password_hash = $1 WHERE id = $2', [
        hashedValue,
        id,
      ]);
    }),
  );

  await db.runSql(`
    ALTER TABLE user_account ALTER COLUMN password_hash SET NOT NULL;
  `);
};

exports.down = function (db) {
  return db.runSql(`
    ALTER TABLE user_account
    DROP COLUMN password_hash;
    
    ALTER TABLE user_account
    RENAME COLUMN password_hash_old TO password_hash;
  `);
};

exports._meta = {
  version: 1,
};
