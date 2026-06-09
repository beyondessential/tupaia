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

// Table name = 'Reproductive Health Product Average Monthly Consumption (AMC), Country Name'
const UNFPAReproductiveHealthProductAmcDashboardReport = {
  id: 'UNFPA_Reproductive_Health_Product_AMC',
  targetItems: [
    {
      key: 'UNFPA_RH_AMC_SAYANA_Press',
      dataBuildersConfig: { codes: ['AMC_4752843e'] },
      viewJson: { color: '#8C5AFB', label: 'SAYANA Press', legendOrder: 8 },
    },
    {
      key: 'UNFPA_RH_AMC_Norethisterone',
      dataBuildersConfig: { codes: ['AMC_542a34bf'] },
      viewJson: { color: '#FD6AC4', label: 'Norethisterone', legendOrder: 9 },
    },
    {
      key: 'UNFPA_RH_AMC_Implant_Contraceptives',
      dataBuildersConfig: { codes: ['AMC_3ff944bf'] },
      viewJson: {
        color: '#0F7F3B',
        label: 'Implant Contraceptives',
        legendOrder: 4,
      },
    },
  ],
};

// Table name = 'Reproductive Health Products Months of Stock (MOS) (mSupply data)'
const UNFPAReproductiveHealthProductMosNationalDashboardReport = {
  id: 'UNFPA_Reproductive_Health_Product_MOS_National',
  targetItems: [
    {
      key: 'UNFPA_RH_MOS_Medroxyprogesterone_acetate_104mgper0dot65ml_SAYANA_Press',
      dataBuildersConfig: { codes: ['MOS_4752843e'] },
      viewJson: { color: '#8C5AFB', label: 'SAYANA Press', legendOrder: 8 },
    },
    {
      key: 'UNFPA_RH_MOS_Norethisterone_enantate_200mgpermL_in_1mL_ampoule_oily_solution',
      dataBuildersConfig: { codes: ['MOS_542a34bf'] },
      viewJson: { color: '#FD6AC4', label: 'Norethisterone', legendOrder: 9 },
    },
    {
      key: 'UNFPA_RH_MOS_Etonogestrel_releasing_implant_single_rod_containing_68mg_of_etonogestrel',
      dataBuildersConfig: { codes: ['MOS_3ff944bf'] },
      viewJson: {
        color: '#0F7F3B',
        label: 'Implant',
        legendOrder: 4,
      },
    },
  ],
};

// Table name = 'Reproductive Health Products Months of Stock (MOS)'
const UNFPAReproductiveHealthProductMosDashboardReport = {
  id: 'UNFPA_Reproductive_Health_Product_MOS',
  targetItems: [
    {
      key: 'UNFPA_RH_MOS_Medroxyprogesterone_acetate_104mgper0dot65ml_SAYANA_Press',
      dataBuildersConfig: { codes: ['MOS_4752843e'] },
      viewJson: { color: '#8C5AFB', label: 'SAYANA Press', legendOrder: 8 },
    },
    {
      key: 'UNFPA_RH_MOS_Norethisterone_enantate_200mgpermL_in_1mL_ampoule_oily_solution',
      dataBuildersConfig: { codes: ['MOS_542a34bf'] },
      viewJson: { color: '#FD6AC4', label: 'Norethisterone', legendOrder: 9 },
    },
    {
      key: 'UNFPA_RH_MOS_Etonogestrel_releasing_implant_single_rod_containing_68mg_of_etonogestrel',
      dataBuildersConfig: { codes: ['MOS_3ff944bf'] },
      viewJson: {
        color: '#0F7F3B',
        label: 'Implant',
        legendOrder: 4,
      },
    },
  ],
};

// Table name = 'Reproductive Health Stock Status: Months Of Stock (mSupply)'
const UNFPARhProductsMosDashboardReport = {
  id: 'UNFPA_RH_Products_MOS',
  targetItems: [
    {
      key: 'UNFPA_RH_SAYANA_Press_MOS',
      dataBuildersConfig: { codes: ['MOS_4752843e'] },
      viewJson: { color: '#8C5AFB', label: 'SAYANA Press', stackId: 8, legendOrder: 8 },
    },
    {
      key: 'UNFPA_RH_Norethisterone_amp_MOS',
      dataBuildersConfig: { codes: ['MOS_542a34bf'] },
      viewJson: { color: '#FD6AC4', label: 'Norethisterone amp', stackId: 9, legendOrder: 9 },
    },
    {
      key: 'UNFPA_RH_Etonogestrel-releasing_implant_MOS',
      dataBuildersConfig: { codes: ['MOS_3ff944bf'] },
      viewJson: {
        color: '#0F7F3B',
        label: 'Implant',
        stackId: 4,
        legendOrder: 4,
      },
    },
  ],
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
    dashboardData.targetItems.forEach(item => {
      delete dashboardReport.dataBuilderConfig.dataClasses[item.key];
      delete dashboardReport.viewJson.chartConfig[item.key];
    });

    await updateBuilderConfigByReportId(db, dashboardReport.dataBuilderConfig, dashboardData.id);
    await updateViewJsonByReportId(db, dashboardReport.viewJson, dashboardData.id);
  }
}

async function restoreItemsForLineChartConfig(db, dashboardData) {
  const dashboardReport = await getDashboardReportById(db, dashboardData.id);
  if (dashboardReport) {
    dashboardData.targetItems.forEach(({ key, dataBuildersConfig, viewJson }) => {
      dashboardReport.dataBuilderConfig.dataClasses[key] = { codes: [dataBuildersConfig.codes] };
      dashboardReport.viewJson.chartConfig[key] = viewJson;
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
