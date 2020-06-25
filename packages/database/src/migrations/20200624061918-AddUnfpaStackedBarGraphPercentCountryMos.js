'use strict';

import { insertObject } from '../utilities/migration';

var dbm;
var type;
var seed;
/*
Dashboard title: Stock Status by product: MOS mSupply, % of countries
Dashboard group name: UNFPA
Dashboard type: Stacked bar chart
Countries: Tonga, Solomon Islands, Vanuatu, Kiribati
Entity: National warehouse only
Vanuatu - CMS (Central Medical Store): VU_1180_20
Solomon Islands - National Medical Store: SB_500092
Tonga - CPMS: TO_CPMS
Kiribati - Tungaru Central Hospital: KI_GEN

Stacked bar graph showing % of countries with MOS in the corresponding 'level group' for each item
Stock status based on MOS:
Stock out (MOS 0) = Red stack on the bar
Below minimum (MOS 1-2) = Orange stack on the bar
Stocked appropriately (MOS 3-6) = Green stack on the bar
Overstock (MOS >6) = Yellow stack on the bar
*/

const dashboardReportId = 'UNFPA_Stock_MOS_By_percent_Countries';
const dashboardReportTitle = 'Stock Status by product: MOS mSupply, % of countries';
const dashboardGroup = 'UNFPA_Project';

const products = [
  { 
    id: "Condoms_male", 
    // includes "Condom, male, varied",
    label: "Male Condoms",
    dataElementCodes: ["MOS_3b3444bf", "MOS_a162942e"],
  },
  { 
    id: "Condoms_female", 
    label: "Female Condoms",
    dataElementCodes: ["MOS_bf4be518"],},
  { 
    id: "Ethinylestradiol_levonorgestrel_30mcg_and_150mcg_tablet", 
    label: "COC",
    dataElementCodes: ["MOS_402924bf"],
  },
  { 
    id: "Levonorgestrel_30mcg_tablet", 
    label: "POP",
    dataElementCodes: ["MOS_47d584bf"],
  },
  { 
    id: "Etonogestrel-releasing_implant_single_rod_containing_68mg_of_etonogestrel", 
    label: "Implant",
    dataElementCodes: ["MOS_3ff944bf"],
  },
  { 
    id: "Jadelle_Contraceptive_Implant", 
    label: "Jadelle",
    dataElementCodes: ["MOS_d2d28620"],},
  { 
    id: "Levonorgestrel_750mcg_tablet_pack_of_two", 
    // includes "Levonorgestrel 1.5mg tablet"
    label: "EC",
    dataElementCodes: ["MOS_47fb04bf", "MOS_47fe44bf"],
  },
  { 
    id: "Medroxyprogesterone_acetate_depot_injection_150mg_in_1mL_vial",
    label: "DMPA",
    dataElementCodes: ["MOS_53d014bf"],
  },
  { 
    id: "Medroxyprogesterone_acetate_104mg_0.65ml_SAYANA_Press",
    label: "SAYANA Press",
    dataElementCodes: ["MOS_4752843e"],
  },
  { 
    id: "Norethisterone_enantate_200mg_mL_in_1mL_ampoule_oily_solution", 
    label: "Norethisterone amp",
    dataElementCodes: ["MOS_542a34bf"],
  },
  { 
    id: "Intra_Uterine_Device", 
    // includes "Copper containing device"
    label: "IUD",
    dataElementCodes: ["MOS_4718f43e", "MOS_3b3994bf"],
  },
];

//Stock status based on MOS:
const groups = {
  // Stock out (MOS 0) = Red stack on the bar
  "Stock out (MOS 0)": {
    "value": 0,
    "operator": "=",
    "color": "Red",
  },
  // Below minimum (MOS 1-2) = Orange stack on the bar
  "Below minimum (MOS 1-2)": {
    "value": [1, 2],
    "operator": "range",
    "color": "Orange",
  },
  // Stocked appropriately (MOS 3-6) = Green stack on the bar
  "Stocked appropriately (MOS 3-6)": {
    "value": [3, 6],
    "operator": "range",
    "color": "Green",
  },
  // Overstock (MOS >6) = Yellow stack on the bar
  "Overstock (MOS >6)": {
    "value": 6,
    "operator": ">",
    "color": "Yellow"
  }
};

const filterCodes = ["VU_1180_20", "SB_500092", "TO_CPMS", "KI_GEN"];
// "measureBuilder": "checkConditions"

const chartConfig = {};
const dataClasses = {};
products.forEach((product, index) => {
  const { id, label, dataElementCodes } = product;
  chartConfig[id] = {
    label: label,
    stackId: 1,
    //legendOrder: index,
    //color: COLORS[index],
  };
  dataClasses[id] = {
    codes: dataElementCodes,
  };
});

const dataBuilderConfig = {

};

const viewJson = {
  name: dashboardReportTitle,
  type: 'chart',
  chartType: 'bar',
  valueType: "percentage",
  periodGranularity: 'month',
}

const dashboardReport = {
  id: dashboardReportId,
  dataBuilder: 'sumPerMonth',
  dataBuilderConfig: dataBuilderConfig,
  dataBuilderConfig: { ...dataBuilderConfig, dataClasses },
  viewJson: { ...viewJson, chartConfig },
  dataServices: [
    {
      isDataRegional: true,
    }
  ],
};

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function(db) {
  insertObject(db, 'dashboardReport', dashboardReport);
  return db.runSql(`
    UPDATE "dashboardGroup"
    SET "dashboardReports" = "dashboardReports" || '{${dashboardReportId}}'
    WHERE "code" = '${dashboardGroup}';
  `);  
};

exports.down = function(db) {
  return db.runSql(`
     DELETE FROM "dashboardReport" WHERE id = '${dashboardReportId}';
     
     UPDATE "dashboardGroup"
      SET "dashboardReports" = array_remove("dashboardReports", '${dashboardReportId}')
      WHERE "code" = '${dashboardGroup}';
  `);
};

exports._meta = {
  "version": 1
};
