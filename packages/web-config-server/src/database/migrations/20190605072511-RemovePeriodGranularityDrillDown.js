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
      SET "viewJson" = "viewJson" - 'periodGranularity'
      WHERE id LIKE 'TO_HPU_%'
        AND "drillDownLevel" = 1;
  `);
};

exports.down = function(db) {
  return db.runSql(`
    UPDATE "dashboardReport"
      SET "viewJson" = "viewJson" || '{ "periodGranularity": "one_month_at_a_time" }'
      WHERE id LIKE 'TO_HPU_%'
        AND "drillDownLevel" = 1;
  `);
};

exports._meta = {
  version: 1,
};
