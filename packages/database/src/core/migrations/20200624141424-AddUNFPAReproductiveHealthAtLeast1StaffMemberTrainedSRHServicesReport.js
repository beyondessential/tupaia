'use strict';

import { insertObject } from '../utilities/migration';
import { arrayToDbString } from '../utilities';

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

const DASHBOARD_GROUP_CODES = [
  'MH_Unfpa_Country',
  'MH_Unfpa_District',
  'FM_Unfpa_Country',
  'FM_Unfpa_District',
  'FJ_Unfpa_Country',
  'FJ_Unfpa_District',
  'TO_Unfpa_Country',
  'TO_Unfpa_District',
  'KI_Unfpa_Country',
  'KI_Unfpa_District',
  'SB_Unfpa_Country',
  'SB_Unfpa_District',
  'VU_Unfpa_Country',
  'VU_Unfpa_District',
  'WS_Unfpa_Country',
  'WS_Unfpa_District',
];

const REPORT_ID = 'UNFPA_Percentage_Of_Facilities_At_Least_1_Staff_Trained_SRH_Services';

const DATA_BUILDER_CONFIG = {
  periodType: 'quarter',
  dataClasses: {
    'Family Planning': {
      numerator: {
        dataValues: ['RHS4UNFPA809'],
        valueOfInterest: {
          operator: '>',
          value: 0,
        },
      },
      denominator: {
        dataValues: ['RHS1UNFPA03'], // We want to count all the surveyed facilities, so using 'Country' data element here which is mandatory for all the survey responses
        valueOfInterest: '*',
      },
    },
    Delivery: {
      numerator: {
        dataValues: ['RHS3UNFPA5410'],
        valueOfInterest: {
          operator: '>',
          value: 0,
        },
      },
      denominator: {
        dataValues: ['RHS1UNFPA03'], // We want to count all the surveyed facilities, so using 'Country' data element here which is mandatory for all the survey responses
        valueOfInterest: '*',
      },
    },
    'SGVB Services': {
      numerator: {
        dataValues: ['RHS2UNFPA292'],
        valueOfInterest: {
          operator: '>',
          value: 0,
        },
      },
      denominator: {
        dataValues: ['RHS1UNFPA03'], // We want to count all the surveyed facilities, so using 'Country' data element here which is mandatory for all the survey responses
        valueOfInterest: '*',
      },
    },
  },
};

const VIEW_JSON = {
  name: '% of Facilities with at least 1 staff member trained in SRH services',
  type: 'chart',
  chartType: 'line',
  labelType: 'fractionAndPercentage',
  valueType: 'percentage',
  periodGranularity: 'quarter',
  chartConfig: {
    'Family Planning': {
      legendOrder: 0,
    },
    Delivery: {
      legendOrder: 1,
    },
    'SGVB Services': {
      legendOrder: 2,
    },
  },
};

const REPORT = {
  id: REPORT_ID,
  dataBuilder: 'percentagesOfValueCountsPerPeriod',
  dataBuilderConfig: DATA_BUILDER_CONFIG,
  viewJson: VIEW_JSON,
};

exports.up = async function (db) {
  await insertObject(db, 'dashboardReport', REPORT);

  return db.runSql(`
    UPDATE
      "dashboardGroup"
    SET
      "dashboardReports" = "dashboardReports" || '{ ${REPORT.id} }'
    WHERE
      "code" in (${arrayToDbString(DASHBOARD_GROUP_CODES)});
  `);
};

exports.down = function (db) {
  return db.runSql(`
    DELETE FROM "dashboardReport" WHERE id = '${REPORT.id}';

    UPDATE
      "dashboardGroup"
    SET
      "dashboardReports" = array_remove("dashboardReports", '${REPORT.id}')
    WHERE
      "code" in (${arrayToDbString(DASHBOARD_GROUP_CODES)});
  `);
};

exports._meta = {
  version: 1,
};
