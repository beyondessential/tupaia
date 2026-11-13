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
  await db.runSql(
    `
      CREATE INDEX IF NOT EXISTS access_request_user_id_project_id_idx ON access_request (user_id, project_id)
      WHERE approved IS NULL;
    `,
  );
};

exports.down = async function (db) {
  await db.runSql('DROP INDEX IF EXISTS access_request_user_id_project_id_idx;');
};

exports._meta = {
  version: 1,
  targets: ['server'],
};
