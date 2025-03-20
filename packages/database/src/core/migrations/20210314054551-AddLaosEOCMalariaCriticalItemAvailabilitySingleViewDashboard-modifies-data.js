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

const REPORT_ID = 'Laos_EOC_Malaria_Critical_Item_Availability_Single_Value';

const DASHBOARD_GROUP_CODES = ['LAOS_EOC_Malaria_Sub_District', 'LAOS_EOC_Malaria_Facility'];

const DATA_BUILDER_CONFIG = {
  periodType: 'month',
  dataClasses: {
    value: {
      numerator: {
        dataValues: [
          'MAL_3645d4bf',
          'MAL_199ffeec',
          'MAL_46cfdeec',
          'MAL_566bceec',
          'MAL_47bb143e',
          'MAL_ORS',
          'MAL_5de7d4bf',
          'MAL_5de2a4bf',
          'MAL_47b2b43e',
          'MAL_Artesunate',
          'MAL_Paracetemol',
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
  name: 'Malaria Critical Item Availability',
  type: 'view',
  viewType: 'singleValue',
  labelType: 'fractionAndPercentage',
  valueType: 'fractionAndPercentage',
  periodGranularity: 'one_month_at_a_time',
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
