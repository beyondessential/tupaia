'use strict';

import { insertObject, updateValues } from '../utilities';
import { updateBuilderConfigByReportId } from '../utilities/migration';

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

// Table name = 'Reproductive Health Product Average Monthly Consumption (AMC), Country Name'
const UNFPAReproductiveHealthProductAmcDashboardReport = {
  id: 'UNFPA_Reproductive_Health_Product_AMC',
  targetItems: {
    UNFPA_RH_AMC_SAYANA_Press: {
      codes: ['AMC_4752843e'],
      color: '#8C5AFB',
      label: 'SAYANA Press',
      legendOrder: 8,
    },
    UNFPA_RH_AMC_Norethisterone: {
      codes: ['AMC_542a34bf'],
      color: '#FD6AC4',
      label: 'Norethisterone',
      legendOrder: 9,
    },
    UNFPA_RH_AMC_Implant_Contraceptives: {
      codes: ['AMC_3ff944bf'],
      color: '#0F7F3B',
      label: 'Implant Contraceptives',
      legendOrder: 4,
    },
  },
};

// Table name = 'Reproductive Health Products Months of Stock (MOS) (mSupply data)'
const UNFPAReproductiveHealthProductMosNationalDashboardReport = {
  id: 'UNFPA_Reproductive_Health_Product_MOS_National',
  targetItems: {
    UNFPA_RH_MOS_Medroxyprogesterone_acetate_104mgper0dot65ml_SAYANA_Press: {
      codes: ['MOS_4752843e'],
      color: '#8C5AFB',
      label: 'SAYANA Press',
      legendOrder: 8,
    },
    UNFPA_RH_MOS_Norethisterone_enantate_200mgpermL_in_1mL_ampoule_oily_solution: {
      codes: ['MOS_542a34bf'],
      color: '#FD6AC4',
      label: 'Norethisterone',
      legendOrder: 9,
    },
    UNFPA_RH_MOS_Etonogestrel_releasing_implant_single_rod_containing_68mg_of_etonogestrel: {
      codes: ['MOS_3ff944bf'],
      color: '#0F7F3B',
      label: 'Implant',
      legendOrder: 4,
    },
  },
};

// Table name = 'Reproductive Health Products Months of Stock (MOS)'
const UNFPAReproductiveHealthProductMosDashboardReport = {
  id: 'UNFPA_Reproductive_Health_Product_MOS',
  targetItems: {
    UNFPA_RH_MOS_Medroxyprogesterone_acetate_104mgper0dot65ml_SAYANA_Press: {
      codes: ['MOS_4752843e'],
      color: '#8C5AFB',
      label: 'SAYANA Press',
      legendOrder: 8,
    },
    UNFPA_RH_MOS_Norethisterone_enantate_200mgpermL_in_1mL_ampoule_oily_solution: {
      codes: ['MOS_542a34bf'],
      color: '#FD6AC4',
      label: 'Norethisterone',
      legendOrder: 9,
    },
    UNFPA_RH_MOS_Etonogestrel_releasing_implant_single_rod_containing_68mg_of_etonogestrel: {
      codes: ['MOS_3ff944bf'],
      color: '#0F7F3B',
      label: 'Implant',
      legendOrder: 4,
    },
  },
};

// Table name = 'Reproductive Health Stock Status: Months Of Stock (mSupply)'
const UNFPARhProductsMosDashboardReport = {
  id: 'UNFPA_RH_Products_MOS',
  targetItems: {
    UNFPA_RH_SAYANA_Press_MOS: {
      codes: ['MOS_4752843e'],
      color: '#8C5AFB',
      label: 'SAYANA Press',
      stackId: 8,
      legendOrder: 8,
    },
    UNFPA_RH_Norethisterone_amp_MOS: {
      codes: ['MOS_542a34bf'],
      color: '#FD6AC4',
      label: 'Norethisterone amp',
      stackId: 9,
      legendOrder: 9,
    },
    'UNFPA_RH_Etonogestrel-releasing_implant_MOS': {
      codes: ['MOS_3ff944bf'],
      color: '#0F7F3B',
      label: 'Implant',
      stackId: 4,
      legendOrder: 4,
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

async function updateViewJsonByReportId(db, newJson, reportId) {
  return updateValues(db, 'dashboardReport', { viewJson: newJson }, { id: reportId });
}

async function deleteItemsFromLineChartConfig(db, dashboardData) {
  const dashboardReport = await getDashboardReportById(db, dashboardData.id);
  if (dashboardReport) {
    Object.keys(dashboardData.targetItems).forEach(key => {
      delete dashboardReport.dataBuilderConfig.dataClasses[key];
      delete dashboardReport.viewJson.chartConfig[key];
    });

    await updateBuilderConfigByReportId(db, dashboardReport.dataBuilderConfig, dashboardData.id);
    await updateViewJsonByReportId(db, dashboardReport.viewJson, dashboardData.id);
  }
}

async function restoreItemsForLineChartConfig(db, dashboardData) {
  const dashboardReport = await getDashboardReportById(db, dashboardData.id);
  if (dashboardReport) {
    Object.entries(dashboardData.targetItems).forEach(([key, { codes, ...othersConfig }]) => {
      dashboardReport.dataBuilderConfig.dataClasses[key] = { codes: [codes] };
      dashboardReport.viewJson.chartConfig[key] = { ...othersConfig };
    });

    await updateBuilderConfigByReportId(db, dashboardReport.dataBuilderConfig, dashboardData.id);
    await updateViewJsonByReportId(db, dashboardReport.viewJson, dashboardData.id);
  }
}

exports.up = async function (db) {
  // Delete these items in dashboardReport (id = 'UNFPA_Reproductive_Health_Product_AMC')
  await deleteItemsFromLineChartConfig(db, UNFPAReproductiveHealthProductAmcDashboardReport);

  // Delete these items in dashboardReport (id = 'UNFPA_Reproductive_Health_Product_MOS_National')
  await deleteItemsFromLineChartConfig(
    db,
    UNFPAReproductiveHealthProductMosNationalDashboardReport,
  );

  // Delete these items in dashboardReport (id = 'UNFPA_Reproductive_Health_Product_MOS')
  await deleteItemsFromLineChartConfig(db, UNFPAReproductiveHealthProductMosDashboardReport);

  // Delete these items in dashboardReport (id = 'UNFPA_RH_Products_MOS')
  await deleteItemsFromLineChartConfig(db, UNFPARhProductsMosDashboardReport);
};

exports.down = async function (db) {
  // Restore these items in 'dashboardReport' tables
  await restoreItemsForLineChartConfig(db, UNFPAReproductiveHealthProductAmcDashboardReport);
  await restoreItemsForLineChartConfig(
    db,
    UNFPAReproductiveHealthProductMosNationalDashboardReport,
  );
  await restoreItemsForLineChartConfig(db, UNFPAReproductiveHealthProductMosDashboardReport);
  await restoreItemsForLineChartConfig(db, UNFPARhProductsMosDashboardReport);
};

exports._meta = {
  version: 1,
};
