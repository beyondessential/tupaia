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

const COUNTRIES = ['WS', 'FJ', 'NR'];

const DASHBOARD_GROUPS_BY_COUNTRY = {
  WS: [
    'WS_Covid_Samoa_Country_COVID-19',
    'WS_Covid_Samoa_District_COVID-19',
    'WS_Covid_Samoa_Village_COVID-19',
  ],
  NR: ['NR_Covid_Nauru_Country_COVID-19', 'NR_Covid_Nauru_District_COVID-19'],
  FJ: ['FJ_Covid_Fiji_Country_COVID-19', 'FJ_Covid_Fiji_District_COVID-19'],
};

const DATA_LEVEL_BY_COUNTRY = {
  WS: 'BY_VILLAGE',
  NR: 'BY_DISTRICT',
  FJ: 'BY_DISTRICT',
};

const DASHBOARD_TEMPLATE = {
  id: '',
  dataBuilder: 'sum',
  dataBuilderConfig: {
    aggregationType: 'SUM',
    dataElementCodes: [],
    entityAggregation: {
      dataSourceEntityType: 'village',
    },
  },
  viewJson: {
    name: '',
    type: 'view',
    viewType: 'singleValue',
    valueType: 'number',
  },
};

const DASHBOARDS = {
  BY_VILLAGE: [
    {
      ...DASHBOARD_TEMPLATE,
      id: 'Total_Number_Of_People_1st_Dose_Covid_Vaccine_By_Village',
      dataBuilderConfig: {
        ...DASHBOARD_TEMPLATE.dataBuilderConfig,
        dataElementCodes: ['COVIDVac4'],
        entityAggregation: {
          dataSourceEntityType: 'village',
        },
      },
      viewJson: {
        ...DASHBOARD_TEMPLATE.viewJson,
        name: 'Total number of people received 1st dose of COVID-19 vaccine',
      },
    },
    {
      ...DASHBOARD_TEMPLATE,
      id: 'Total_Number_Of_People_2nd_Dose_Covid_Vaccine_By_Village',
      dataBuilderConfig: {
        ...DASHBOARD_TEMPLATE.dataBuilderConfig,
        dataElementCodes: ['COVIDVac8'],
        entityAggregation: {
          dataSourceEntityType: 'village',
        },
      },
      viewJson: {
        ...DASHBOARD_TEMPLATE.viewJson,
        name: 'Total number of people received 2nd dose of COVID-19 vaccine',
      },
    },
  ],
  BY_DISTRICT: [
    {
      ...DASHBOARD_TEMPLATE,
      id: 'Total_Number_Of_People_1st_Dose_Covid_Vaccine_By_District',
      dataBuilderConfig: {
        ...DASHBOARD_TEMPLATE.dataBuilderConfig,
        dataElementCodes: ['COVIDVac4'],
        entityAggregation: {
          dataSourceEntityType: 'district',
        },
      },
      viewJson: {
        ...DASHBOARD_TEMPLATE.viewJson,
        name: 'Total number of people received 1st dose of COVID-19 vaccine',
      },
    },
    {
      ...DASHBOARD_TEMPLATE,
      id: 'Total_Number_Of_People_2nd_Dose_Covid_Vaccine_By_District',
      dataBuilderConfig: {
        ...DASHBOARD_TEMPLATE.dataBuilderConfig,
        dataElementCodes: ['COVIDVac8'],
        entityAggregation: {
          dataSourceEntityType: 'district',
        },
      },
      viewJson: {
        ...DASHBOARD_TEMPLATE.viewJson,
        name: 'Total number of people received 2nd dose of COVID-19 vaccine',
      },
    },
  ],
};

exports.up = async function (db) {
  // 1. dashboards
  for (const dataLevel of ['BY_VILLAGE', 'BY_DISTRICT']) {
    for (const dashboard of DASHBOARDS[dataLevel]) {
      await insertObject(db, 'dashboardReport', dashboard);
    }
  }

  // 2. add to dashboard groups
  for (const country of COUNTRIES) {
    for (const groupCode of DASHBOARD_GROUPS_BY_COUNTRY[country]) {
      const dataLevel = DATA_LEVEL_BY_COUNTRY[country];
      const dashboardReportIds = DASHBOARDS[dataLevel].map(d => d.id);

      await db.runSql(`
        UPDATE "dashboardGroup"
        SET "dashboardReports" = "dashboardReports" || '{ ${dashboardReportIds.join(',')} }'
        WHERE code = '${groupCode}';
      `);
    }
  }

  return null;
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
