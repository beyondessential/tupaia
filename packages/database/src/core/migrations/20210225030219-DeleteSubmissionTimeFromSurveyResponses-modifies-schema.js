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
  return db.runSql(`ALTER TABLE survey_response DROP COLUMN IF EXISTS submission_time`);
};

exports.down = async function (db) {
  return db.runSql(`ALTER TABLE survey_response ADD COLUMN submission_time timestamptz`);
};

exports._meta = {
  version: 1,
};
