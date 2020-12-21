'use strict';

import {
  getDashboardReportById,
  updateValues,
  updateBuilderConfigByReportId,
  updateViewJsonByReportId,
} from '../utilities/migration';

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

const dashboardReports = ['UNFPA_RH_Contraceptives_Offered', 'UNFPA_RH_Services_Offered'];
const extraConfig = {
  aggregationType: 'SUM_MOST_RECENT_PER_FACILITY',
  withName: true,
};

exports.up = async function (db) {
  dashboardReports.forEach(async id => {
    // Update dataBuilder to 'analytics'
    await updateValues(db, 'dashboardReport', { dataBuilder: 'analytics' }, { id });

    // Add extra config to "dataBuilderConfig"
    const dashboardReport = await getDashboardReportById(db, id);
    const { dataBuilderConfig } = dashboardReport;
    const newDataBuilderConfig = { ...dataBuilderConfig, ...extraConfig };
    await updateBuilderConfigByReportId(db, newDataBuilderConfig, id);

    // Update viewJson's valueType
    const { viewJson } = dashboardReport;
    viewJson.valueType = 'text';
    await updateViewJsonByReportId(db, viewJson, id);
  });
};

exports.down = async function (db) {
  dashboardReports.forEach(async id => {
    // Update dataBuilder to 'analytics'
    await updateValues(db, 'dashboardReport', { dataBuilder: 'sumLatestPerMetric' }, { id });

    // Add extra config to "dataBuilderConfig"
    const dashboardReport = await getDashboardReportById(db, id);
    const { dataBuilderConfig } = dashboardReport;
    Object.keys(extraConfig).forEach(key => delete dataBuilderConfig[key]);
    await updateBuilderConfigByReportId(db, dataBuilderConfig, id);

    // Update viewJson's valueType
    const { viewJson } = dashboardReport;
    viewJson.valueType = 'boolean';
    await updateViewJsonByReportId(db, viewJson, id);
  });
};

exports._meta = {
  version: 1,
};
