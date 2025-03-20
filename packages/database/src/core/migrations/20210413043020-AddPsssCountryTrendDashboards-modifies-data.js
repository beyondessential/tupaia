'use strict';

import { insertObject } from '../utilities';

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

const PSSS_COUNTRIES = [
  'AS',
  'CK',
  'FJ',
  'FM',
  'GU',
  'KI',
  'MH',
  'MP',
  'NC',
  'NR',
  'NU',
  'NZ',
  'PF',
  'PG',
  'PI',
  'PW',
  'SB',
  'TK',
  'TO',
  'TV',
  'VU',
  'WF',
  'WS',
];

const THINGS = {
  AFR: 'PSSS_Confirmed_AFR_Cases',
  Diarrhoea: 'PSSS_Confirmed_DIA_Cases',
  ILI: 'PSSS_Confirmed_ILI_Cases',
  PF: 'PSSS_Confirmed_PF_Cases',
  DLI: 'PSSS_Confirmed_DLI_Cases',
};

const COLOURS = {
  AFR: '#F0965BFF', // orange
  Diarrhoea: '#81DEE4FF', // aqua
  ILI: '#4DA347FF', // green
  PF: '#1C49A7FF', // blue
  DLI: '#8455F6', // purple
};

const getDashboardReportId = thingName =>
  `PSSS_Country_${thingName}_Weekly_Case_Number_Trend_Graph`;

const getDashboardGroupCode = country => `${country}_PSSS_Syndromic_Surveillance`;

const getDashboardReport = (id, thingName) => {
  return {
    id,
    dataBuilder: 'analyticsPerPeriod',
    dataBuilderConfig: {
      periodType: 'week',
      aggregationType: 'FINAL_EACH_WEEK',
      dataElementCode: THINGS[thingName],
      entityAggregation: {
        dataSourceEntityType: 'country',
        aggregationEntityType: 'country',
      },
    },
    viewJson: {
      name: `${thingName} Weekly Case Number Trend Graph`,
      type: 'chart',
      chartType: 'line',
      chartConfig: {
        $all: {
          color: COLOURS[thingName],
        },
      },
      defaultTimePeriod: {
        end: {
          unit: 'week',
          offset: 0,
        },
        start: {
          unit: 'week',
          offset: -52,
        },
      },
      periodGranularity: 'week',
      presentationOptions: {
        periodTickFormat: '[W]w',
      },
    },
  };
};

exports.up = async function (db) {
  const dashboardReportIds = [];

  for (const [thingName, thingDataElementCode] of Object.entries(THINGS)) {
    const dashboardReportId = getDashboardReportId(thingName);
    dashboardReportIds.push(dashboardReportId);

    const dashboardReport = getDashboardReport(dashboardReportId, thingName, thingDataElementCode);
    await insertObject(db, 'dashboardReport', dashboardReport);
  }

  const newDashboardReportIdsArray = `{${dashboardReportIds.join(',')}}`;

  for (const country of PSSS_COUNTRIES) {
    const dashboardGroupCode = getDashboardGroupCode(country);
    await db.runSql(
      `UPDATE "dashboardGroup" SET "dashboardReports" = "dashboardReports" || '${newDashboardReportIdsArray}' WHERE code = '${dashboardGroupCode}';`,
    );
  }
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
