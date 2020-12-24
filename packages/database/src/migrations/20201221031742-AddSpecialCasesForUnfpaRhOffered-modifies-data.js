'use strict';

import { getDashboardReportById, updateBuilderConfigByReportId } from '../utilities/migration';

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
  specialCases: {
    $all: 'Yes',
  },
};

exports.up = async function (db) {
  dashboardReports.forEach(async id => {
    // Add extra config to "dataBuilderConfig"
    const dashboardReport = await getDashboardReportById(db, id);
    const { dataBuilderConfig } = dashboardReport;
    const newDataBuilderConfig = { ...dataBuilderConfig, ...extraConfig };
    await updateBuilderConfigByReportId(db, newDataBuilderConfig, id);
  });
};

exports.down = async function (db) {
  dashboardReports.forEach(async id => {
    // Delete extra config to "dataBuilderConfig"
    const dashboardReport = await getDashboardReportById(db, id);
    const { dataBuilderConfig } = dashboardReport;
    Object.keys(extraConfig).forEach(key => delete dataBuilderConfig[key]);
    await updateBuilderConfigByReportId(db, dataBuilderConfig, id);
  });
};

exports._meta = {
  version: 1,
};
