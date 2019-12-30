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
      "dataBuilderConfig" = replace(
        "dataBuilderConfig"::text,
        '"type": "dataElementGroup"', '"type": "group"'
      )::jsonb
    WHERE
      "dataBuilder" = 'sumLatestSeriesData'
  `);
};

exports.down = function(db) {
  return db.runSql(`
    UPDATE
      "dashboardReport"
    SET
      "dataBuilderConfig" = replace(
        "dataBuilderConfig"::text,
        '"type": "group"', '"type": "dataElementGroup"'
      )::jsonb
    WHERE
      "dataBuilder" = 'sumLatestSeriesData'
  `);
};

exports._meta = {
  version: 1,
};
