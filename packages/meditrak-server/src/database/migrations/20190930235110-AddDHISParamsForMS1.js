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
    UPDATE survey SET integration_metadata = integration_metadata || jsonb_build_object('dhis2', jsonb_build_object('isDataRegional', true)) WHERE code LIKE 'MCSR_%';
  `);
};

exports.down = function(db) {
  return db.runSql(`
    UPDATE survey SET integration_metadata = integration_metadata - 'dhis2' WHERE code LIKE 'MCSR_%';
  `);
};

exports._meta = {
  version: 1,
};
