'use strict';

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
      ADD CONSTRAINT user_account_first_name_trimmed
        CHECK (first_name IS NULL OR first_name = TRIM(first_name)),
      ADD CONSTRAINT user_account_last_name_trimmed
        CHECK (last_name IS NULL OR last_name = TRIM(last_name)),
      ADD CONSTRAINT user_account_email_trimmed
        CHECK (email IS NULL OR email = TRIM(email)),
      ADD CONSTRAINT user_account_employer_trimmed
        CHECK (employer IS NULL OR employer = TRIM(employer)),
      ADD CONSTRAINT user_account_position_trimmed
        CHECK (position IS NULL OR position = TRIM(position)),
      ADD CONSTRAINT user_account_mobile_number_trimmed
        CHECK (mobile_number IS NULL OR mobile_number = TRIM(mobile_number));
  `);
};

exports.down = async function (db) {
  await db.runSql(`
    ALTER TABLE user_account
      DROP CONSTRAINT IF EXISTS user_account_first_name_trimmed,
      DROP CONSTRAINT IF EXISTS user_account_last_name_trimmed,
      DROP CONSTRAINT IF EXISTS user_account_email_trimmed,
      DROP CONSTRAINT IF EXISTS user_account_employer_trimmed,
      DROP CONSTRAINT IF EXISTS user_account_position_trimmed,
      DROP CONSTRAINT IF EXISTS user_account_mobile_number_trimmed;
  `);
};

exports._meta = {
  version: 1,
};
