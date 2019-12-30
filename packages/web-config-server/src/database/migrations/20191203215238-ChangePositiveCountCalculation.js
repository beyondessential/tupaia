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

const REPORT_IDS = {
  chart: 'PG_Strive_PNG_Weekly_Percentage_of_Positive_Malaria_Against_Consultations',
  singleValue: 'PG_Strive_PNG_Weekly_Percentage_of_Positive_Consultations',
};
const POSITIVE_COUNT_CONFIG = {
  new: {
    dataBuilder: 'sumPerWeek',
    dataBuilderConfig: {
      dataSource: { type: 'single', codes: ['SSWT1021', 'SSWT1022', 'SSWT1023'] },
    },
  },
  old: {
    dataBuilder: 'countEventsPerPeriod',
    dataBuilderConfig: {
      programCode: 'SCRF',
      dataValues: {
        STR_CRF169: { operator: 'regex', value: 'Positive' },
      },
      periodType: 'week',
    },
  },
};

const updatePositiveCountConfig = async (db, config) =>
  db.runSql(`
    UPDATE
      "dashboardReport"
    SET
      "dataBuilderConfig" = jsonb_set(
        "dataBuilderConfig",
        '{dataBuilders,mrdtPositive}',
        '${JSON.stringify(config)}'
      )
    WHERE id = '${REPORT_IDS.singleValue}';

    UPDATE
      "dashboardReport"
    SET
      "dataBuilderConfig" = jsonb_set(
        "dataBuilderConfig",
        '{dataBuilders,positive,dataBuilderConfig,dataBuilders,positiveCount}',
        '${JSON.stringify(config)}'
      )
    WHERE id = '${REPORT_IDS.chart}';
  `);

exports.up = function(db) {
  return updatePositiveCountConfig(db, POSITIVE_COUNT_CONFIG.new);
};

exports.down = function(db) {
  return updatePositiveCountConfig(db, POSITIVE_COUNT_CONFIG.old);
};

exports._meta = {
  version: 1,
};
