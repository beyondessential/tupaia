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

const REPORT_ID = 'Imms_FridgeDailyTemperatures';

exports.up = async function(db) {
  db.runSql(
    `UPDATE "dashboardReport"
    SET
      "dataBuilder" = 'analyticsPerPeriod',
      "dataBuilderConfig" = jsonb_set("dataBuilderConfig", '{aggregationType}', '"FINAL_EACH_DAY"')
    WHERE id = '${REPORT_ID}';`,
  );
};

exports.down = async function(db) {
  db.runSql(
    `UPDATE "dashboardReport"
    SET
      "dataBuilder" = 'finalValuesPerDay',
      "dataBuilderConfig" = "dataBuilderConfig" - 'aggregationType'
    WHERE id = '${REPORT_ID}';`,
  );
};

exports._meta = {
  version: 1,
};
