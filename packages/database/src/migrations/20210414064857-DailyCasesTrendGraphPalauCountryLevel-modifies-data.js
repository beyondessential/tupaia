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

const DISEASE_DATA_ELEMENTS = {
  AFR: {
    dataElement: 'PSSS_AFR_Daily_Cases',
    name: 'Acute fever and rash',
    color: '#F0965BFF', // orange
  },
  Diarrhoea: {
    dataElement: 'PSSS_DIA_Daily_Cases',
    name: 'Diarrhoea',
    color: '#81DEE4FF', // aqua
  },
  ILI: {
    dataElement: 'PSSS_ILI_Daily_Cases',
    name: 'Influenza like illness',
    color: '#4DA347FF', // green
  },
  PF: {
    dataElement: 'PSSS_PF_Daily_Cases',
    name: 'Prolonged fever',
    color: '#1C49A7FF', // blue
  },
  DLI: {
    dataElement: 'PSSS_DLI_Daily_Cases',
    name: 'Dengue like illness',
    color: '#8455F6', // purple
  },
  Conjunctivitis: {
    dataElement: 'PSSS_CON_Daily_Cases',
    name: 'Conjunctivitis',
    color: '#BE72E0', // pink
  },
};

const getDashboardReportId = diseaseName => `PSSS_PW_${diseaseName}_Daily_Case_Trend_Graph_Country`;

const dashboardGroupCode = 'PW_PSSS_Syndromic_Surveillance';

const getDashboardReport = (id, diseaseName, dataElementCode, color) => {
  return {
    id,
    dataBuilder: 'sumPerPeriod',
    dataBuilderConfig: {
      dataClasses: {
        value: {
          codes: [dataElementCode],
        },
      },
      aggregationType: 'FINAL_EACH_DAY',
      entityAggregation: {
        dataSourceEntityType: 'facility',
        aggregationEntityType: 'country',
      },
    },
    viewJson: {
      name: `${diseaseName} Daily Case Number Trend Graph`,
      type: 'chart',
      chartType: 'line',
      chartConfig: {
        value: {
          color,
        },
      },
      defaultTimePeriod: {
        end: {
          unit: 'day',
          offset: 0,
        },
        start: {
          unit: 'day',
          offset: -30,
        },
      },
      periodGranularity: 'day',
    },
  };
};

exports.up = async function (db) {
  const dashboardReportIds = [];

  for (const [diseaseName, { dataElement, name, color }] of Object.entries(DISEASE_DATA_ELEMENTS)) {
    const dashboardReportId = getDashboardReportId(diseaseName);
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
