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
    UPDATE "dashboardReport"
    SET "viewJson" = "viewJson" || '{"description": "Average each month is calculated across operational facilities that submitted data. If a facility was marked as non-operational, or did not submit data in a given month, it is not included in the average."}'
    WHERE id = '12' OR id = '10';
  `);
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
