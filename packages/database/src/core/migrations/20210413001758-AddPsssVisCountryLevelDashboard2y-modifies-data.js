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

const getDashboardReportId = thingName =>
  `PSSS_Country_${thingName}_Case_Numbers_With_Percent_Sites_Reporting`;

const getDashboardGroupCode = country => `${country}_PSSS_Syndromic_Surveillance`;

const getDashboardReport = (id, thingName, thingDataElementCode) => {
  return {
    id,
    dataBuilder: 'composeDataPerPeriod',
    dataBuilderConfig: {
      dataBuilders: {
        cases: {
          dataBuilder: 'sumPerPeriod',
          dataBuilderConfig: {
            periodType: 'week',
            dataClasses: {
              value: {
                codes: [thingDataElementCode],
              },
            },
            aggregationType: 'FINAL_EACH_WEEK',
            entityAggregation: {
              dataSourceEntityType: 'country',
              aggregationEntityType: 'country',
            },
          },
        },
        percent_sites_reporting: {
          dataBuilder: 'composePercentagesPerPeriod',
          dataBuilderConfig: {
            percentages: {
              percent_sites_reporting: {
                numerator: 'PSSS_Confirmed_Sites_Reported',
                denominator: 'PSSS_Confirmed_Sites',
              },
            },
            dataBuilders: {
              PSSS_Confirmed_Sites: {
                dataBuilder: 'sumPerPeriod',
                dataBuilderConfig: {
                  periodType: 'week',
                  dataClasses: {
                    value: {
                      codes: ['PSSS_Confirmed_Sites'],
                    },
                  },
                  aggregationType: 'FINAL_EACH_WEEK',
                  entityAggregation: {
                    dataSourceEntityType: 'country',
                    aggregationEntityType: 'country',
                  },
                },
              },
              PSSS_Confirmed_Sites_Reported: {
                dataBuilder: 'sumPerPeriod',
                dataBuilderConfig: {
                  periodType: 'week',
                  dataClasses: {
                    value: {
                      codes: ['PSSS_Confirmed_Sites_Reported'],
                    },
                  },
                  aggregationType: 'FINAL_EACH_WEEK',
                  entityAggregation: {
                    dataSourceEntityType: 'country',
                    aggregationEntityType: 'country',
                  },
                },
              },
            },
          },
        },
      },
    },
    viewJson: {
      name: `${thingName} Cases & Reporting Sites`,
      type: 'chart',
      chartType: 'composed',
      chartConfig: {
        cases: {
          color: '#4674c1',
          label: 'Cases',
          yName: 'Cases',
          chartType: 'bar',
          valueType: 'oneDecimalPlace',
          yAxisOrientation: 'left',
        },
        percent_sites_reporting: {
          color: '#eb7d3c',
          label: '% of Sites Reported',
          yName: '% of Sites Reported',
          chartType: 'line',
          valueType: 'percentage',
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
          yAxisOrientation: 'right',
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

exports.down = async function (db) {
  for (const country of PSSS_COUNTRIES) {
    const dashboardGroupCode = getDashboardGroupCode(country);
    await db.runSql(
      `UPDATE "dashboardGroup" SET "dashboardReports" = '{PSSS_Number_of_Sentinel_Sites}' WHERE code = '${dashboardGroupCode}';`,
    );
  }

  for (const [thingName, thingDataElementCode] of Object.entries(THINGS)) {
    const dashboardReportId = getDashboardReportId(thingName);
    await db.runSql(`DELETE FROM "dashboardReport" WHERE id = '${dashboardReportId}';`);
  }
};

exports._meta = {
  version: 1,
};
