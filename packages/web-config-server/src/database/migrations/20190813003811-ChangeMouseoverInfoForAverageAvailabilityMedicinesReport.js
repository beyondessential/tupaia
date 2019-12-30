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
    SET "viewJson" = "viewJson" || '{"description": "This average is calculated based on the most recent data submitted for each operational facility. If a facility is marked as non-operational, or has not submitted data, then it is not included in this average."}'
    WHERE id = '10';
  `);
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  "version": 1
};
