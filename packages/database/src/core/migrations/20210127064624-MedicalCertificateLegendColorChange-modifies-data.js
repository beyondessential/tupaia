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

const dashboardReportId = 'TO_CD_Medical_Certs_Distributed';
const previousLabels = {
  CD73: 'Missionary - LDS',
  CD74: 'Missionary - Other',
  CD75: 'Visa - Tonga Immigration',
  CD76: 'Visa - China',
  CD77: 'Visa - Fiji',
  CD81: 'Visa - Malaysia',
  CD82: 'Visa - Samoa (Apia and Pangopango)',
  CD83: 'Visa - Thailand',
  CD84: 'Visa - Other',
  CD85: 'Employment - Bankers (BSP, TDB)',
  CD86: 'Employment - FWC Workers',
  CD87: 'Employment - South Pacific Business Development (SPBD)',
  CD88: 'Employment - Seafarers',
  CD89: 'Employment - Tonga Civil Servant (all government workers)',
  CD90: 'Employment - Other',
  CD84a: 'Employment - Army, Firemen, Wardens',
};
const newLabels = {
  CD73: 'LDS',
  CD74: 'other',
  CD75: 'Tonga',
  CD76: 'China',
  CD77: 'Fiji',
  CD81: 'Malaysia',
  CD82: 'Samoa',
  CD83: 'Thailand',
  CD84: 'Other',
  CD85: 'Bankers',
  CD86: 'FWC',
  CD87: 'SPBD',
  CD88: 'Seafarers',
  CD89: 'Tonga',
  CD90: 'Others',
  CD84a: 'Army',
};
const valueKeyToGroup = {
  Visa: ['CD75', 'CD76', 'CD77', 'CD81', 'CD82', 'CD83', 'CD84'],
  Employment: ['CD85', 'CD86', 'CD87', 'CD88', 'CD89', 'CD90', 'CD84a'],
  Missionary: ['CD73', 'CD74'],
};
const chartConfig = {
  Visa: {
    stackId: 1,
    legendOrder: 2,
  },
  Employment: {
    stackId: 1,
    legendOrder: 3,
  },
  Missionary: {
    stackId: 1,
    legendOrder: 1,
  },
};

async function getDashboardReportById(db, id) {
  const { rows: dashboardReports } = await db.runSql(`
      SELECT * FROM "dashboardReport"
      WHERE id = '${id}';
  `);
  return dashboardReports[0] || null;
}
async function updateBuilderConfigByReportId(db, newConfig, reportId) {
  return updateValues(db, 'dashboardReport', { dataBuilderConfig: newConfig }, { id: reportId });
}
async function updateViewJsonByReportId(db, newJson, reportId) {
  return updateValues(db, 'dashboardReport', { viewJson: newJson }, { id: reportId });
}
exports.up = async function (db) {
  const dashboardReport = await getDashboardReportById(db, dashboardReportId);

  const newDataBuilderConfig = {
    ...dashboardReport.dataBuilderConfig,
    labels: newLabels,
    valueKeyToGroup,
  };
  await updateBuilderConfigByReportId(db, newDataBuilderConfig, dashboardReportId);

  const newViewJson = {
    ...dashboardReport.viewJson,
    chartConfig,
  };
  await updateViewJsonByReportId(db, newViewJson, dashboardReportId);
};

exports.down = async function (db) {
  const dashboardReport = await getDashboardReportById(db, dashboardReportId);

  const newDataBuilderConfig = {
    ...dashboardReport.dataBuilderConfig,
    labels: previousLabels,
  };
  delete newDataBuilderConfig.valueKeyToOption;
  await updateBuilderConfigByReportId(db, newDataBuilderConfig, dashboardReportId);

  const newViewJson = dashboardReport.viewJson;
  delete newViewJson.chartConfig;
  await updateViewJsonByReportId(db, newViewJson, dashboardReportId);
};

exports._meta = {
  version: 1,
};
