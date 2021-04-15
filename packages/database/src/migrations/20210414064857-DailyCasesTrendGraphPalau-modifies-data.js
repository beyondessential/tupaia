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

const THINGS = {
  AFR: {
    dataElement: 'PSSS_Confirmed_AFR_Cases',
    name: 'Acute fever and rash',
    color: '#F0965BFF', // orange
  },
  Diarrhoea: {
    dataElement: 'PSSS_Confirmed_DIA_Cases',
    name: 'Diarrhoea',
    color: '#81DEE4FF', // aqua
  },
  ILI: {
    dataElement: 'PSSS_Confirmed_ILI_Cases',
    name: 'Influenza like illness',
    color: '#4DA347FF', // green
  },
  PF: {
    dataElement: 'PSSS_Confirmed_PF_Cases',
    name: 'Prolonged fever',
    color: '#1C49A7FF', // blue
  },
  DLI: {
    dataElement: 'PSSS_Confirmed_DLI_Cases',
    name: 'Dengue like illness',
    color: '#8455F6', // purple
  },
  Conjunctivitis: {
    dataElement: 'PSSS_Confirmed_DLI_Cases',
    name: 'Conjunctivitis',
    color: '#BE72E0', // pink
  },
};

const getDashboardReportId = thingName => `PSSS_NR_${thingName}_Daily_Case_Trend_Graph_Country`;

const dashboardGroupCode = 'NR_PSSS_Syndromic_Surveillance';

const getDashboardReport = (id, thingName, thingDataElementCode, color) => {
  return {
    id,
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
    viewJson: {
      name: `${thingName} Daily Case Number Trend Graph`,
      type: 'chart',
      chartType: 'line',
      chartConfig: {
        value: {
          color,
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
    },
  };
};

exports.up = async function (db) {
  const dashboardReportIds = [];

  for (const [thingName, { dataElement, name, color }] of Object.entries(THINGS)) {
    const dashboardReportId = getDashboardReportId(thingName);
    dashboardReportIds.push(dashboardReportId);

    const dashboardReport = getDashboardReport(dashboardReportId, name, dataElement, color);
    await insertObject(db, 'dashboardReport', dashboardReport);
  }

  const newDashboardReportIdsArray = `{${dashboardReportIds.join(',')}}`;

  await db.runSql(
    `UPDATE "dashboardGroup" SET "dashboardReports" = "dashboardReports" || '${newDashboardReportIdsArray}' WHERE code = '${dashboardGroupCode}';`,
  );
};

exports.down = function (db) {};

exports._meta = {
  version: 1,
};
