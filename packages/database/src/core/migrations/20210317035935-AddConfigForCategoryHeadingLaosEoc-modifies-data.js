'use strict';

import { updateValues } from '../utilities/migration';

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

async function getDashboardReportById(db, id) {
  const { rows: dashboardReports } = await db.runSql(`
      SELECT * FROM "dashboardReport"
      WHERE id = '${id}';
  `);
  return dashboardReports[0] || null;
}

const categoryPresentationOptions = {
  conditions: {
    red: {
      color: '#b71c1c',
      label: '',
      legendLabel: 'Stock out',
    },
    green: {
      color: '#33691e',
      label: '',
      legendLabel: 'In stock',
    },
    orange: {
      color: 'orange',
      label: '',
      legendLabel: 'At least 1 item out of stock',
    },
  },
  showRawValue: true,
  showNestedRows: true,
};

const previousPresentationOptions = {
  type: 'condition',
  conditions: [
    {
      key: 'red',
      color: '#b71c1c',
      label: '',
      condition: 0,
      description: 'Stock number: ',
      legendLabel: 'Stock out',
    },
    {
      key: 'green',
      color: '#33691e',
      label: '',
      condition: {
        '>': 0,
      },
      description: 'Stock number: ',
      legendLabel: 'In stock',
    },
  ],
  showRawValue: true,
};

const newPresentationOptions = {
  type: 'condition',
  conditions: [
    {
      key: 'red',
      color: '#b71c1c',
      label: 'Stock number: 0',
      condition: {
        '=': '',
      },
      legendLabel: 'Stock out',
    },
    {
      key: 'green',
      color: '#33691e',
      label: '',
      condition: {
        '>': 0,
      },
      description: 'Stock number: ',
      legendLabel: 'In stock',
    },
    {
      key: 'orange',
      color: 'orange',
      label: '',
      legendLabel: 'At least 1 item out of stock',
    },
  ],
  showRawValue: true,
};

const categoryAggregator = {
  type: '$condition',
  conditions: [
    {
      key: 'red',
      condition: {
        in: [null, 0],
      },
    },
    {
      key: 'green',
      condition: {
        '>': 0,
      },
    },
    {
      key: 'orange',
      condition: {
        someNotAll: { '>': 0 },
      },
    },
  ],
};

const dashboardReportIds = [
  'Laos_EOC_Malaria_Stock_Availability_Facility',
  'Laos_EOC_Malaria_Stock_Availability_Sub_District',
];

exports.up = async function (db) {
  for (const id of dashboardReportIds) {
    const dashboard = await getDashboardReportById(db, id);
    const { dataBuilderConfig, viewJson } = dashboard;
    const newDataBuilderConfig = { ...dataBuilderConfig, categoryAggregator };
    const newViewJson = {
      ...viewJson,
      categoryPresentationOptions,
      presentationOptions: newPresentationOptions,
    };
    await updateValues(db, 'dashboardReport', { dataBuilderConfig: newDataBuilderConfig }, { id });
    await updateValues(db, 'dashboardReport', { viewJson: newViewJson }, { id });
  }
};

exports.down = async function (db) {
  for (const id of dashboardReportIds) {
    const dashboard = await getDashboardReportById(db, id);
    const { dataBuilderConfig, viewJson } = dashboard;
    delete dataBuilderConfig.categoryAggregator;
    delete viewJson.categoryPresentationOptions;
    viewJson.presentationOptions = previousPresentationOptions;
    await updateValues(db, 'dashboardReport', { dataBuilderConfig }, { id });
    await updateValues(db, 'dashboardReport', { viewJson }, { id });
  }
};

exports._meta = {
  version: 1,
};
