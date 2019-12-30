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
      "dataBuilderConfig" = regexp_replace(
        "dataBuilderConfig"::text,
        '"code": "(.*?)"',
        '"codes": ["\\1"]',
        'g'
      )::jsonb
    WHERE
      "dataBuilder" = 'sumLatestSeriesData';
  `);
};

exports.down = function(db) {
  return db.runSql(`
    UPDATE
      "dashboardReport"
    SET
      "dataBuilderConfig" = regexp_replace(
        "dataBuilderConfig"::text,
        '"codes": \\[(.*?)\\]',
        '"code": \\1',
        'g'
      )::jsonb
    WHERE
      "dataBuilder" = 'sumLatestSeriesData';
  `);
};

exports._meta = {
  version: 1,
};
