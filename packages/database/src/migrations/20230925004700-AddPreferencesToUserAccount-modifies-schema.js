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
  // We are replacing the project_id column with a preferences column, so we need to remove that first
  await db.runSql(`
      ALTER TABLE user_account
      DROP COLUMN project_id
  `);
  await db.runSql(`
    ALTER TABLE user_account
    ADD COLUMN preferences JSONB NOT NULL DEFAULT '{}'
  `);
};

exports.down = async function (db) {
  await db.runSql(`
    ALTER TABLE user_account DROP COLUMN preferences
  `);
  await db.runSql(`
    ALTER TABLE user_account
    ADD COLUMN project_id TEXT
    ADD FOREIGN KEY (project_id) REFERENCES project(id)
  `);
};

exports._meta = {
  version: 1,
};
