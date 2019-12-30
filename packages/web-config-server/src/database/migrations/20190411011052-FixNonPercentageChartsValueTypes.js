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
    SET
      "viewJson" = "viewJson" || '{"valueType":"text", "name":"Total value stock on hand across mSupply© Facilities"}',
      "dataBuilder" = 'sumLatestData'
    WHERE "id" = '7';
    
    UPDATE "dashboardReport"
    SET "viewJson" = "viewJson" || '{"valueType":"text"}'
    WHERE "id" = '38';

    UPDATE "dashboardReport"
    SET "dataBuilder" = 'sumLatestData'
    where "dataBuilder" = 'latestMultiDataElement';
  `);
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
