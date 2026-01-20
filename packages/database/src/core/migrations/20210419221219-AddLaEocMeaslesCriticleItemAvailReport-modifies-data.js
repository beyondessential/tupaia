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

const reportId = 'Laos_EOC_Measles_Critical_Item_Availability';
const dashboardGroupCodes = ['LAOS_EOC_Measles_Sub_District', 'LAOS_EOC_Measles_Facility'];

const dataBuilderConfig = {
  periodType: 'month',
  dataClasses: {
    value: {
      numerator: {
        dataValues: [
          'SOH_f8cf15e9',
          'SOH_85ea65e9',
          'LA_SOH_41e9d4bf',
          'LA_SOH_61d3f4bf',
          'LA_SOH_61fe94bf',
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
          value: 5,
        },
      },
    },
  },
  entityAggregation: {
    dataSourceEntityType: 'facility',
  },
};

const viewJson = {
  name: 'Measles: Critical Items in Stock',
  type: 'chart',
  chartType: 'line',
  labelType: 'fractionAndPercentage',
  valueType: 'percentage',
  periodGranularity: 'month',
  chartConfig: {
    $all: {
      yAxisDomain: {
        max: {
          type: 'number',
          value: 1,
        },
        min: {
          type: 'number',
          value: 0,
        },
      },
    },
  },
};

const report = {
  id: reportId,
  dataBuilder: 'percentagesOfValueCountsPerPeriod',
  dataBuilderConfig,
  viewJson,
  dataServices: [{ isDataRegional: false }],
};

exports.up = async function (db) {
  await insertObject(db, 'dashboardReport', report);

  return db.runSql(`
    UPDATE "dashboardGroup" 
    SET "dashboardReports" = "dashboardReports" ||  '{${report.id}}'
    WHERE code IN (${arrayToDbString(dashboardGroupCodes)});
  `);
};

exports.down = async function (db) {
  return db.runSql(`
    DELETE FROM "dashboardReport" WHERE id = '${report.id}';

    UPDATE "dashboardGroup"
    SET "dashboardReports" = array_remove("dashboardReports", '${report.id}')
    WHERE code IN (${arrayToDbString(dashboardGroupCodes)});
  `);
};

exports._meta = {
  version: 1,
};
