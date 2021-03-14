'use strict';

import { insertObject, arrayToDbString } from '../utilities/migration';

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

const REPORT_ID = 'Laos_EOC_Malaria_Critical_Item_Availability';

const DASHBOARD_GROUP_CODES = ['LAOS_EOC_Malaria_Sub_District', 'LAOS_EOC_Malaria_Facility'];

const DATA_BUILDER_CONFIG = {
  periodType: 'month',
  dataClasses: {
    value: {
      numerator: {
        dataValues: [
          'MAL_ACT_6x1',
          'MAL_ACT_6x2',
          'MAL_ACT_6x3',
          'MAL_ACT_6x4',
          'MAL_G6PD_RDT',
          'MAL_ORS',
          'MAL_Primaquine_15_mg',
          'MAL_Primaquine_7_5_mg',
          'MAL_RDT',
          'MAL_Artesunate',
          'MAL_Paracetamol',
        ],
        valueOfInterest: {
          operator: '>',
          value: 0,
        },
      },
      denominator: {
        key: '$orgUnitCount',
        operationConfig: {
          operator: 'MULTIPLY',
          value: 11,
        },
      },
    },
  },
  entityAggregation: {
    dataSourceEntityType: 'facility',
  },
};

const VIEW_JSON = {
  name: 'Malaria Critical Item Availability Over Time',
  type: 'chart',
  chartType: 'line',
  labelType: 'fractionAndPercentage',
  valueType: 'percentage',
  periodGranularity: 'month',
};

const REPORT = {
  id: REPORT_ID,
  dataBuilder: 'percentagesOfValueCountsPerPeriod',
  dataBuilderConfig: DATA_BUILDER_CONFIG,
  viewJson: VIEW_JSON,
  dataServices: [{ isDataRegional: false }],
};

exports.up = async function (db) {
  await insertObject(db, 'dashboardReport', REPORT);

  return db.runSql(`
    UPDATE "dashboardGroup" 
    SET "dashboardReports" = "dashboardReports" ||  '{${REPORT.id}}'
    WHERE code IN (${arrayToDbString(DASHBOARD_GROUP_CODES)});
  `);
};

exports.down = async function (db) {
  return db.runSql(`
    DELETE FROM "dashboardReport" WHERE id = '${REPORT.id}';

    UPDATE "dashboardGroup"
    SET "dashboardReports" = array_remove("dashboardReports", '${REPORT.id}')
    WHERE code IN (${arrayToDbString(DASHBOARD_GROUP_CODES)});
  `);
};

exports._meta = {
  version: 1,
};
