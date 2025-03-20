'use strict';

import { updateValues } from '../utilities';

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

async function updateBuilderConfigByReportId(db, newConfig, reportId) {
  return updateValues(db, 'dashboardReport', { dataBuilderConfig: newConfig }, { id: reportId });
}

// Table name = 'Stock Status by product: MOS mSupply, % of countries, UNFPA'
const UNFPAStockMOSByPercentCountriesDashboardReport = {
  id: 'UNFPA_Stock_MOS_By_percent_Countries',
  targetItems: {
    'Medroxyprogesterone_acetate_104mg_0.65ml_SAYANA_Press': {
      name: 'SAYANA Press',
      codes: ['MOS_4752843e'],
    },
    Norethisterone_enantate_200mg_mL_in_1mL_ampoule_oily_solution: {
      name: 'Norethisterone amp',
      codes: ['MOS_542a34bf'],
    },
    'Etonogestrel-releasing_implant_single_rod_containing_68mg_of_etonogestrel': {
      name: 'Implant',
      codes: ['MOS_3ff944bf'],
    },
  },
};

async function getDashboardReportById(db, id) {
  const { rows: dashboardReports } = await db.runSql(`
      SELECT * FROM "dashboardReport"
      WHERE id = '${id}';
  `);
  return dashboardReports[0] || null;
}

async function deleteItemsFromBarChartConfig(db, dashboardData) {
  const dashboardReport = await getDashboardReportById(db, dashboardData.id);
  if (dashboardReport) {
    Object.keys(dashboardData.targetItems).forEach(key => {
      delete dashboardReport.dataBuilderConfig.labels[key];
      delete dashboardReport.dataBuilderConfig.dataClasses[key];
    });

    await updateBuilderConfigByReportId(db, dashboardReport.dataBuilderConfig, dashboardData.id);
  }
}

async function restoreItemsForBarChartConfig(db, dashboardData) {
  const dashboardReport = await getDashboardReportById(db, dashboardData.id);
  if (dashboardReport) {
    Object.entries(dashboardData.targetItems).forEach(([key, { name, codes }]) => {
      dashboardReport.dataBuilderConfig.labels[key] = name;
      dashboardReport.dataBuilderConfig.dataClasses[key] = { codes: [codes] };
    });

    await updateBuilderConfigByReportId(db, dashboardReport.dataBuilderConfig, dashboardData.id);
  }
}

exports.up = async function (db) {
  // Delete these items in dashboardReport (id = 'UNFPA_Stock_MOS_By_percent_Countries')
  await deleteItemsFromBarChartConfig(db, UNFPAStockMOSByPercentCountriesDashboardReport);
};

exports.down = async function (db) {
  await restoreItemsForBarChartConfig(db, UNFPAStockMOSByPercentCountriesDashboardReport);
};

exports._meta = {
  version: 1,
};
