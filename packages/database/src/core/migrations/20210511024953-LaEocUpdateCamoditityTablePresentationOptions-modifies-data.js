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
const dashboardReportIds = [
  'Laos_EOC_Measles_Stock_Availability_Facility',
  'Laos_EOC_Measles_Stock_Availability_Sub_District',
  'Laos_EOC_Malaria_Stock_Availability_Facility',
  'Laos_EOC_Malaria_Stock_Availability_Sub_District',
];

const newPresentationOptions = {
  type: 'condition',
  conditions: [
    {
      key: 'red',
      color: '#b71c1c',
      label: 'Stock number: 0',
      condition: {
        '=': 0,
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

async function getDashboardReportById(db, id) {
  const { rows: dashboardReports } = await db.runSql(`
      SELECT * FROM "dashboardReport"
      WHERE id = '${id}';
  `);
  return dashboardReports[0] || null;
}

exports.up = async function (db) {
  for (const id of dashboardReportIds) {
    const dashboard = await getDashboardReportById(db, id);
    const { viewJson } = dashboard;
    const newViewJson = {
      ...viewJson,
      presentationOptions: newPresentationOptions,
    };
    await updateValues(db, 'dashboardReport', { viewJson: newViewJson }, { id });
  }
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
