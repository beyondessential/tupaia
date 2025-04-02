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
    name: 'Acute Fever and Rash',
    color: '#F0965BFF', // orange
  },
  DIA: {
    dataElement: 'PSSS_DIA_Daily_Cases',
    name: 'Diarrhoea',
    color: '#81DEE4FF', // aqua
  },
  ILI: {
    dataElement: 'PSSS_ILI_Daily_Cases',
    name: 'Influenza Like Illness',
    color: '#4DA347FF', // green
  },
  PF: {
    dataElement: 'PSSS_PF_Daily_Cases',
    name: 'Prolonged Fever',
    color: '#1C49A7FF', // blue
  },
  DLI: {
    dataElement: 'PSSS_DLI_Daily_Cases',
    name: 'Dengue Like Illness',
    color: '#8455F6', // purple
  },
  CON: {
    dataElement: 'PSSS_CON_Daily_Cases',
    name: 'Conjunctivitis',
    color: '#BE72E0', // pink
  },
};

const DASHBOARD_GROUP_TEMPLATE = {
  organisationLevel: 'Facility',
  userGroup: 'PSSS Tupaia',
  organisationUnitCode: 'PW',
  dashboardReports: null,
  name: 'Syndromic Surveillance National Data',
  code: 'PW_PSSS_Syndromic_Surveillance_National_Data_Facility_PSSS_Tupaia',
  projectCodes: '{psss}',
};

const getDashboardReportId = diseaseCode =>
  `PSSS_PW_${diseaseCode}_Daily_Case_Trend_Graph_Facility`;

const getDashboardReport = (id, diseaseName, dataElement, color) => ({
  id,
  dataBuilder: 'sumPerPeriod',
  dataBuilderConfig: {
    dataClasses: {
      value: {
        codes: [dataElement],
      },
    },
    aggregationType: 'FINAL_EACH_DAY',
    entityAggregation: {
      dataSourceEntityType: 'facility',
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
  await insertObject(db, 'dashboardGroup', {
    ...DASHBOARD_GROUP_TEMPLATE,
    dashboardReports: newDashboardReportIdsArray,
  });
};

exports.down = function (db) {};

exports._meta = {
  version: 1,
};
