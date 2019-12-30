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
    SET "viewJson" = "viewJson" || '{"periodGranularity": "day"}'
    WHERE "dataBuilder" = 'dataElementsOverTotalOperational' OR "dataBuilder" = 'percentChildrenDataElement';

    UPDATE "dashboardReport"
    SET "viewJson" = "viewJson" || '{"periodGranularity": "month"}'
    WHERE "dataBuilder" = 'monthlyDataValues';

    UPDATE "dashboardReport"
    SET "viewJson" = "viewJson" || '{"periodGranularity": "one_month_at_a_time"}'
    WHERE "dataBuilder" = 'singleColumnTable' OR "dataBuilder" = 'tableFromDataElementGroups' OR "dataBuilder" = 'tableOfEvents';
  `);
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
