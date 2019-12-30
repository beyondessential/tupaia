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
  return db.runSql(`
    ALTER TABLE survey_response
      ADD COLUMN entity_code TEXT REFERENCES entity(code);

    ALTER TABLE survey_response
      ALTER COLUMN clinic_id DROP NOT NULL;
  `);
};

exports.down = function(db) {
  // delete all survey responses that are against entities instead of clinics -
  // this is a data loss but once we delete the entity_code column those surveys
  // will be busted anyway
  return db.runSql(`
    DELETE FROM survey_response WHERE clinic_id IS NULL;

    ALTER TABLE survey_response
      ALTER COLUMN clinic_id SET NOT NULL;

    ALTER TABLE survey_response
      DROP COLUMN entity_code;
  `);
};

exports._meta = {
  version: 1,
};
