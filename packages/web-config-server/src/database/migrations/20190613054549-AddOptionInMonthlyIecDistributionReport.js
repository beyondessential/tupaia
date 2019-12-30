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

const BASE_REPORT_ID = 'TO_HPU_Validation_HP_05';

exports.up = function(db) {
  return db.runSql(`
    UPDATE
      "dashboardReport"
    SET
      "dataBuilderConfig" = jsonb_set(
        "dataBuilderConfig",
        '{dataElementCodes}',
        '["HP245a1"]'::jsonb || ("dataBuilderConfig"->'dataElementCodes')::jsonb
      )
    WHERE id = '${BASE_REPORT_ID}' AND "dataBuilder" = 'singleColumnTable';
  `);
};

exports.down = function(db) {
  return db.runSql(`
    UPDATE
      "dashboardReport"
    SET
      "dataBuilderConfig" = jsonb_set(
        "dataBuilderConfig",
        '{dataElementCodes}',
        ("dataBuilderConfig"->'dataElementCodes')::jsonb - 'HP245a1'
      )
    WHERE id = '${BASE_REPORT_ID}' AND "dataBuilder" = 'singleColumnTable';
  `);
};

exports._meta = {
  version: 1,
};
