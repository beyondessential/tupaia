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

const SYNDROMES = {
  AFR: 'PSSS_Confirmed_AFR_Cases',
  DIA: 'PSSS_Confirmed_DIA_Cases',
  ILI: 'PSSS_Confirmed_ILI_Cases',
  PF: 'PSSS_Confirmed_PF_Cases',
  DLI: 'PSSS_Confirmed_DLI_Cases',
};

const COLOURS = {
  AFR: '#F0965BFF', // orange
  DIA: '#81DEE4FF', // aqua
  ILI: '#4DA347FF', // green
  PF: '#1C49A7FF', // blue
  DLI: '#8455F6', // purple
};

const getDashboardReportId = syndrome =>
  `PSSS_Country_${syndrome}_Weekly_Case_Number_Trend_Graph_Past_Years`;

const getDashboardGroupCode = country => `${country}_PSSS_Syndromic_Surveillance`;

const getDashboardReport = (id, syndrome) => {
  return {
    id,
    dataBuilder: 'analyticsYearOnYear',
    dataBuilderConfig: {
      layerYearOnYearSeries: {
        yearRange: 4,
      },
      periodType: 'week',
      aggregationType: ['FINAL_EACH_WEEK'],
      dataElementCode: SYNDROMES[syndrome],
      entityAggregation: {
        dataSourceEntityType: 'country',
        aggregationEntityType: 'country',
      },
    },
    viewJson: {
      name: `${syndrome} Weekly Case Number Trend Graph Past Years`,
      type: 'chart',
      chartType: 'line',
      chartConfig: {
        $all: {
          color: COLOURS[syndrome],
          opacity: 'ascending',
        },
      },
      datePickerLimits: {
        end: {
          unit: 'week',
          modifier: 'end_of',
          modifierUnit: 'year',
        },
        start: {
          unit: 'week',
          modifier: 'start_of',
          modifierUnit: 'year',
        },
      },
      defaultTimePeriod: {
        end: {
          unit: 'week',
          modifier: 'end_of',
          modifierUnit: 'year',
        },
        start: {
          unit: 'week',
          modifier: 'start_of',
          modifierUnit: 'year',
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

  for (const [syndrome, syndromeDataElementCode] of Object.entries(SYNDROMES)) {
    const dashboardReportId = getDashboardReportId(syndrome);
    dashboardReportIds.push(dashboardReportId);

    const dashboardReport = getDashboardReport(
      dashboardReportId,
      syndrome,
      syndromeDataElementCode,
    );
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

exports.down = async function (db) {
  for (const syndrome of Object.keys(SYNDROMES)) {
    const dashboardReportId = getDashboardReportId(syndrome);
    for (const country of PSSS_COUNTRIES) {
      const dashboardGroupCode = getDashboardGroupCode(country);
      await db.runSql(`
        update "dashboardGroup" 
        set "dashboardReports" = array_remove("dashboardReports", '${dashboardReportId}')
        where "code" = '${dashboardGroupCode}';

        delete from "dashboardReport" where "id" = '${dashboardReportId}';
    `);
    }
  }
};

exports._meta = {
  version: 1,
};
