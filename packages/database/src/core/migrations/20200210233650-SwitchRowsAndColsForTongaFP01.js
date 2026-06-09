/* eslint-disable camelcase */

import { build2DTableCells, build2dTableStringFormatCells } from '../utilities/migration';

('use strict');

var dbm;
var type;
var seed;

const convertToTableOfDataValuesSql = table => {
  return `
  UPDATE
      "dashboardReport"
  SET
    "dataBuilder" = 'tableOfDataValues',
    "dataBuilderConfig" = '${JSON.stringify({
      rows: table.category ? { category: table.category, rows: table.rows } : table.rows,
      columns: table.columns,
      cells: table.cells,
    })}'
  WHERE
    id = '${
      table.id
    }' AND "dataBuilder" IN ('singleColumnTable', 'tableFromDataElementGroups', 'tableOfDataValues');
  `;
};

//-----------------------------------------------------------------------
// Old Configuration
//-----------------------------------------------------------------------

const tFP_01Rows = [
  'New Acceptors',
  'Change in Method To',
  'Change in Method From',
  'Transfers In',
  'Transfers Out',
  'Discontinuation',
  'Net Change',
  'Total Acceptors',
];

const tFP_01Cols = [
  'IUD',
  'Pill Combined',
  'Pill Single',
  'Condom Male',
  'Condom Female',
  'Natural Method',
  'Sterilization Male',
  'Sterilization Female',
  'Depo-Provera',
  'Jadelle (implant)',
  'Other',
  'Totals',
];

const tFP_01_stringFormatRows = ['Net_Change', 'Acceptors'];

const tFP_01_stringFormatCols = [
  'IUD',
  'Pill_Combined',
  'Pill_Single',
  'Condom_Male',
  'Condom_Female',
  'Natural_Method',
  'Sterilization_Male',
  'Sterilization_Female',
  'Depo_Provera',
  'Jadelle',
  'Other',
];

const tFP_01_stringFormatFunction = (row, col) => {
  return `Family_Planning_${row}_${col}`;
};

const oldTableFP_01 = {
  rows: tFP_01Rows,
  columns: tFP_01Cols,
  cells: [
    ...build2DTableCells({
      prefix: 'FP',
      numRows: tFP_01Rows.length - 2, // Need to manually append the final two rows
      numCols: tFP_01Cols.length,
      startCell: 2,
      addRowTotal: true,
      insertCells: [{ name: 'FP19_1', rowIndex: 1, colIndex: 6 }],
    }),
    ...build2dTableStringFormatCells(
      tFP_01_stringFormatFunction,
      tFP_01_stringFormatRows,
      tFP_01_stringFormatCols,
      { addRowTotal: true },
    ),
  ],
  id: 'TO_RH_Validation_FP',
};

//-----------------------------------------------------------------------
// New Configuration
//-----------------------------------------------------------------------

const newTableFP_01 = {
  rows: tFP_01Cols,
  columns: tFP_01Rows,
  cells: [
    [
      'FP2',
      'FP13',
      'FP23',
      'FP34',
      'FP45',
      'FP56',
      'Family_Planning_Net_Change_IUD',
      'Family_Planning_Acceptors_IUD',
    ],
    [
      'FP3',
      'FP14',
      'FP24',
      'FP35',
      'FP46',
      'FP57',
      'Family_Planning_Net_Change_Pill_Combined',
      'Family_Planning_Acceptors_Pill_Combined',
    ],
    [
      'FP4',
      'FP15',
      'FP25',
      'FP36',
      'FP47',
      'FP58',
      'Family_Planning_Net_Change_Pill_Single',
      'Family_Planning_Acceptors_Pill_Single',
    ],
    [
      'FP5',
      'FP16',
      'FP26',
      'FP37',
      'FP48',
      'FP59',
      'Family_Planning_Net_Change_Condom_Male',
      'Family_Planning_Acceptors_Condom_Male',
    ],
    [
      'FP6',
      'FP17',
      'FP27',
      'FP38',
      'FP49',
      'FP60',
      'Family_Planning_Net_Change_Condom_Female',
      'Family_Planning_Acceptors_Condom_Female',
    ],
    [
      'FP7',
      'FP18',
      'FP28',
      'FP39',
      'FP50',
      'FP61',
      'Family_Planning_Net_Change_Natural_Method',
      'Family_Planning_Acceptors_Natural_Method',
    ],
    [
      'FP8',
      'FP19_1',
      'FP29',
      'FP40',
      'FP51',
      'FP62',
      'Family_Planning_Net_Change_Sterilization_Male',
      'Family_Planning_Acceptors_Sterilization_Male',
    ],
    [
      'FP9',
      'FP19',
      'FP30',
      'FP41',
      'FP52',
      'FP63',
      'Family_Planning_Net_Change_Sterilization_Female',
      'Family_Planning_Acceptors_Sterilization_Female',
    ],
    [
      'FP10',
      'FP20',
      'FP31',
      'FP42',
      'FP53',
      'FP64',
      'Family_Planning_Net_Change_Depo_Provera',
      'Family_Planning_Acceptors_Depo_Provera',
    ],
    [
      'FP11',
      'FP21',
      'FP32',
      'FP43',
      'FP54',
      'FP65',
      'Family_Planning_Net_Change_Jadelle',
      'Family_Planning_Acceptors_Jadelle',
    ],
    [
      'FP12',
      'FP22',
      'FP33',
      'FP44',
      'FP55',
      'FP66',
      'Family_Planning_Net_Change_Other',
      'Family_Planning_Acceptors_Other',
    ],
    [
      '$columnTotal',
      '$columnTotal',
      '$columnTotal',
      '$columnTotal',
      '$columnTotal',
      '$columnTotal',
      '$columnTotal',
      '$columnTotal',
    ],
  ],
  id: 'TO_RH_Validation_FP',
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
  return db.runSql(`
    ${convertToTableOfDataValuesSql(newTableFP_01)}
  `);
};

exports.down = function (db) {
  return db.runSql(`
    ${convertToTableOfDataValuesSql(oldTableFP_01)}
  `);
};

exports._meta = {
  version: 1,
};
