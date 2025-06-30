'use strict';

import { insertObject } from '../utilities/migration';

var dbm;
var type;
var seed;

const dashboardReportId = 'UNFPA_Stock_MOS_By_percent_Countries';
const dashboardReportTitle = 'Stock Status by product: MOS mSupply, % of countries';
const dashboardGroup = 'UNFPA_Project';

const products = [
  {
    id: 'Condoms_male',
    // includes "Condom, male, varied",
    label: 'Male Condoms',
    dataElementCodes: ['MOS_3b3444bf', 'MOS_a162942e'],
  },
  {
    id: 'Condoms_female',
    label: 'Female Condoms',
    dataElementCodes: ['MOS_bf4be518'],
  },
  {
    id: 'Ethinylestradiol_levonorgestrel_30mcg_and_150mcg_tablet',
    label: 'COC',
    dataElementCodes: ['MOS_402924bf'],
  },
  {
    id: 'Levonorgestrel_30mcg_tablet',
    label: 'POP',
    dataElementCodes: ['MOS_47d584bf'],
  },
  {
    id: 'Etonogestrel-releasing_implant_single_rod_containing_68mg_of_etonogestrel',
    label: 'Implant',
    dataElementCodes: ['MOS_3ff944bf'],
  },
  {
    id: 'Jadelle_Contraceptive_Implant',
    label: 'Jadelle',
    dataElementCodes: ['MOS_d2d28620'],
  },
  {
    id: 'Levonorgestrel_750mcg_tablet_pack_of_two',
    // includes "Levonorgestrel 1.5mg tablet"
    label: 'EC',
    dataElementCodes: ['MOS_47fb04bf', 'MOS_47fe44bf'],
  },
  {
    id: 'Medroxyprogesterone_acetate_depot_injection_150mg_in_1mL_vial',
    label: 'DMPA',
    dataElementCodes: ['MOS_53d014bf'],
  },
  {
    id: 'Medroxyprogesterone_acetate_104mg_0.65ml_SAYANA_Press',
    label: 'SAYANA Press',
    dataElementCodes: ['MOS_4752843e'],
  },
  {
    id: 'Norethisterone_enantate_200mg_mL_in_1mL_ampoule_oily_solution',
    label: 'Norethisterone amp',
    dataElementCodes: ['MOS_542a34bf'],
  },
  {
    id: 'Intra_Uterine_Device',
    // includes "Copper containing device"
    label: 'IUD',
    dataElementCodes: ['MOS_4718f43e', 'MOS_3b3994bf'],
  },
];
// values should be inclusive, git should pick this up
const groups = {
  MOS_0: {
    value: 0,
    operator: '=',
  },
  'MOS_1-2': {
    value: [0, 3],
    operator: 'rangeExclusive',
  },
  'MOS_3-6': {
    value: [3, 6],
    operator: 'range',
  },
  MOS_6: {
    value: 6,
    operator: '>',
  },
};
// Stock status based on MOS:
const chartConfig = {
  // Stock out (MOS 0) = Red stack on the bar
  MOS_0: {
    label: 'Stock out (MOS 0)',
    color: 'Red',
    stackId: 1,
    legendOrder: 1,
  },
  // Below minimum (MOS 1-2) = Orange stack on the bar
  'MOS_1-2': {
    label: 'Below minimum (MOS 1-2)',
    color: 'Orange',
    stackId: 1,
    legendOrder: 2,
  },
  // Stocked appropriately (MOS 3-6) = Green stack on the bar
  'MOS_3-6': {
    label: 'Stocked appropriately (MOS 3-6)',
    color: 'Green',
    stackId: 1,
    legendOrder: 3,
  },
  // Overstock (MOS >6) = Yellow stack on the bar
  MOS_6: {
    label: 'Overstock (MOS > 6)',
    color: 'Yellow',
    stackId: 1,
    legendOrder: 4,
  },
};

const filterCodes = ['VU_1180_20', 'SB_500092', 'TO_CPMS', 'KI_GEN'];

const dataClasses = {};
const labels = {};
products.forEach((product, index) => {
  const { id, dataElementCodes, label } = product;
  dataClasses[id] = {
    codes: dataElementCodes,
  };
  labels[id] = label;
});

const dataBuilderConfig = {
  filter: {
    organisationUnit: {
      in: filterCodes,
    },
  },
  groups,
  labels,
  fillPercentGroup: 'MOS_0',
  periodType: 'month',
};

const viewJson = {
  name: dashboardReportTitle,
  type: 'chart',
  chartType: 'bar',
  valueType: 'percentage',
  xName: '%',
  periodGranularity: 'month',
  chartConfig,
};

const dashboardReport = {
  id: dashboardReportId,
  dataBuilder: 'composePercentageInGroupByDataClass',
  dataBuilderConfig: { ...dataBuilderConfig, dataClasses },
  viewJson,
  dataServices: [
    {
      isDataRegional: true,
    },
  ],
};

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function (db) {
  insertObject(db, 'dashboardReport', dashboardReport);
  return db.runSql(`
    UPDATE "dashboardGroup"
    SET "dashboardReports" = "dashboardReports" || '{${dashboardReportId}}'
    WHERE "code" = '${dashboardGroup}';
  `);
};

exports.down = function (db) {
  return db.runSql(`
     DELETE FROM "dashboardReport" WHERE id = '${dashboardReportId}';
     
     UPDATE "dashboardGroup"
      SET "dashboardReports" = array_remove("dashboardReports", '${dashboardReportId}')
      WHERE "code" = '${dashboardGroup}';
  `);
};

exports._meta = {
  version: 1,
};
