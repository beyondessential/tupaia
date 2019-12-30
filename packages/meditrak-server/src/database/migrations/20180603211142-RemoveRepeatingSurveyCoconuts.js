'use strict';

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function(db) {
  // Remove any coconut rewards for repeating surveys.
  return db.runSql(`
  DELETE FROM user_reward WHERE record_id IN (
    SELECT id FROM survey_response WHERE survey_id IN (
      SELECT id FROM survey WHERE can_repeat = true
      )
  );
  `);
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
