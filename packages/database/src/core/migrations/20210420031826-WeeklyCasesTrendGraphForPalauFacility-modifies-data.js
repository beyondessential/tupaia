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
    dataElement: 'PSSS_AFR_Total_Cases',
    name: 'Acute Fever and Rash',
    color: '#F0965BFF', // orange
  },
  DIA: {
    dataElement: 'PSSS_DIA_Total_Cases',
    name: 'Diarrhoea',
    color: '#81DEE4FF', // aqua
  },
  ILI: {
    dataElement: 'PSSS_ILI_Total_Cases',
    name: 'Influenza Like Illness',
    color: '#4DA347FF', // green
  },
  PF: {
    dataElement: 'PSSS_PF_Total_Cases',
    name: 'Prolonged Fever',
    color: '#1C49A7FF', // blue
  },
  DLI: {
    dataElement: 'PSSS_DLI_Total_Cases',
    name: 'Dengue Like Illness',
    color: '#8455F6', // purple
  },
  CON: {
    dataElement: 'PSSS_CON_Total_Cases',
    name: 'Conjunctivitis',
    color: '#BE72E0', // pink
  },
};

const getDashboardReportId = diseaseCode =>
  `PSSS_PW_${diseaseCode}_Weekly_Case_Trend_Graph_Facility`;

const dashboardGroupCode = 'PW_PSSS_Syndromic_Surveillance_National_Data_Facility_Public';

const getDashboardReport = (id, diseaseName, dataElementCode, color) => ({
  id,
  dataBuilder: 'analyticsPerPeriod',
  dataBuilderConfig: {
    dataElementCode,
    aggregations: [
      {
        type: 'FINAL_EACH_WEEK_FILL_EMPTY_WEEKS',
        config: {
          fillEmptyPeriodsWith: null,
        },
      },
    ],
    entityAggregation: {
      dataSourceEntityType: 'facility',
    },
  },
  viewJson: {
    name: `${diseaseName} Weekly Case Number Trend Graph`,
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
    presentationOptions: {
      periodTickFormat: '[W]w',
    },
    periodGranularity: 'week',
  },
});

exports.up = async function (db) {
  const dashboardReportIds = [];
  for (const [diseaseCode, { dataElement, name, color }] of Object.entries(DISEASE_DATA_ELEMENTS)) {
    const dashboardReportId = getDashboardReportId(diseaseCode);
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
