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
  return db.runSql(
    `
      ALTER TABLE survey
      ALTER COLUMN integration_metadata SET DEFAULT '{"dhis2":{"isDataRegional":true}}';
    `,
  );
};

exports.down = function(db) {
  return db.runSql(
    `
      ALTER TABLE survey
      ALTER COLUMN integration_metadata SET DEFAULT '{"dhis2":{"is_data_regional":true}}';
    `,
  );
};

exports._meta = {
  version: 1,
};
