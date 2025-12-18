'use strict';

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

const REPORT_ID = 'PG_Strive_PNG_Weekly_Number_of_Febrile_Cases';

exports.up = function (db) {
  return db.runSql(`
    UPDATE
      "dashboardReport"
    SET
      "dataBuilderConfig" = "dataBuilderConfig" #- '{dataBuilders,febrile,dataBuilderConfig,dataValues}'
    WHERE
      id = '${REPORT_ID}'
  `);
};

exports.down = function (db) {
  return db.runSql(`
    UPDATE
      "dashboardReport"
    SET
      "dataBuilderConfig" = jsonb_set(
        "dataBuilderConfig",
        '{dataBuilders,febrile,dataBuilderConfig,dataValues}',
        '{ "STR_CRF125": "1" }'
    )
    WHERE
      id = '${REPORT_ID}'
  `);
};

exports._meta = {
  version: 1,
};
