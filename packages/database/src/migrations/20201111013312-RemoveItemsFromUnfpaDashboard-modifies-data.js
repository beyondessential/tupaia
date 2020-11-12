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

const mapOverlaysGroupsRelationData = [
  {
    mapOverlayGroupName: 'RH Commodity Months of Stock (National Warehouse)',
    map_overlay_group_id: '5f2c7ddb61f76a513a000013',
    items: [
      { id: '5f2c7ddb61f76a513a00005e', child_id: 'RH_MOS_4752843e_Regional', sort_order: 0 },
      { id: '5f2c7ddb61f76a513a000059', child_id: 'RH_MOS_3ff944bf_Regional', sort_order: 0 },
      { id: '5f2c7ddb61f76a513a00005f', child_id: 'RH_MOS_542a34bf_Regional', sort_order: 0 },
    ],
  },
  {
    mapOverlayGroupName: 'Reproductive Health Commodities (mSupply)',
    map_overlay_group_id: '5f2c7ddb61f76a513a000028',
    items: [
      { id: '5f2c7ddb61f76a513a0000a4', child_id: 'UNFPA_RH_SAYANA_Press', sort_order: 9 },
      { id: '5f2c7ddb61f76a513a000029', child_id: 'UNFPA_RH_Norethisterone_amp', sort_order: 10 },
      {
        id: '5f2c7ddb61f76a513a00009f',
        child_id: 'UNFPA_RH_Etonogestrel-releasing_implant',
        sort_order: 4,
      },
    ],
  },
];

// Data for Deleting in dashboardReport (name = 'Stock Status by product: MOS mSupply, % of countries, UNFPA')
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
    UNFPA_Stock_MOS_By_percent_Countries: { name: 'Implant', codes: ['MOS_3ff944bf'] },
  },
};

// Data for Deleting in dashboardReport (name = 'Reproductive Health Product Average Monthly Consumption (AMC), Country Name')
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

// Data for Deleting in dashboardReport (name = 'Reproductive Health Products Months of Stock (MOS) (mSupply data)')
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

// Data for Deleting in dashboardReport (name = 'Reproductive Health Products Months of Stock (MOS)')
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

// Data for Deleting in dashboardReport (name = 'Reproductive Health Stock Status: Months Of Stock (mSupply)')
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
  //  Remove these items in map overlay group (check @Params: mapOverlaysGroupsRelationData)
  for (const relations of mapOverlaysGroupsRelationData) {
    for (const item of relations.items) {
      await db.runSql(`
        delete from map_overlay_group_relation mogr
        using map_overlay_group mog
        where mog."name" = '${relations.mapOverlayGroupName}' 
        and mogr.child_id = '${item.child_id}'
      `);
    }
  }

  // Delete these items in dashboardReport (id = 'UNFPA_Stock_MOS_By_percent_Countries')
  await deleteItemsFromBarChartConfig(db, UNFPAStockMOSByPercentCountriesDashboardReport);

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
  // Restore these items in 'map_overlay_group_relation' table
  for (const restoreData of mapOverlaysGroupsRelationData) {
    for (const item of restoreData.items) {
      const data = {
        child_type: 'mapOverlay',
        map_overlay_group_id: restoreData.map_overlay_group_id,
        ...item,
      };
      await insertObject(db, 'map_overlay_group_relation', data);
    }
  }

  // Restore these items in 'dashboardReport' tables
  await restoreItemsForBarChartConfig(db, UNFPAStockMOSByPercentCountriesDashboardReport);
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
