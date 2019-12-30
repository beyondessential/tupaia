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
    UPDATE
      "dashboardReport"
    SET
      "viewJson" = "viewJson"  - 'chartType' || '{ "type": "matrix" }'::jsonb
    WHERE
      "viewJson"->>'chartType' = 'matrix';
  `);
};

exports.down = function(db) {
  return db.runSql(`
    UPDATE
      "dashboardReport"
    SET
      "viewJson" = "viewJson" || '{ "type: "chart", "chartType": "matrix" }'::jsonb
    WHERE
      "viewJson"->>'type' = 'matrix';
  `);
};

exports._meta = {
  version: 1,
};
