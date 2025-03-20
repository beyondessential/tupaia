/* eslint-disable camelcase */

import {
  buildSingleColumnTableCells,
  build2DTableCells,
  build2dTableStringFormatCells,
} from '../utilities/migration';

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

//------------------------------------------------------------------------------
// Single Column Table Migrations
//------------------------------------------------------------------------------

const tableFP_03 = {
  rows: ['Total number of contraceptive users reported annually by TFHA'],
  columns: ['Total number'],
  cells: buildSingleColumnTableCells({ prefix: 'FP', start: 170, end: 170 }),
  id: 'TO_RH_Validation_FP_03',
};

//------------------------------------------------------------------------------

const tableIMMS01 = {
  rows: [
    'Number of Eligible School Entry Students Immunized with DPT5',
    'Number of Eligible School Entry Students >7 years old Immunized with Td',
    'Number of Eligible High School Students Immunized with Td this month',
    'Total',
  ],
  columns: ['School Immunization Services'],
  cells: buildSingleColumnTableCells({ prefix: 'IMMS', start: 2, end: 4, addColumnTotal: true }),
  id: 'TO_RH_Validation_IMMS01',
};

//------------------------------------------------------------------------------

const tableIMMS03 = {
  rows: [
    'BCG Infant',
    'Hep B Birth Dose Infant',
    'DPT/HepB/HIB Dose 1',
    'DPT/HepB/HIB Dose 2',
    'DPT/HepB/HIB Dose 3',
    'IPV Dose 1',
    'OPV Dose 1',
    'OPV Dose 2',
    'OPV Dose 3',
    'DPT Dose 4',
    'MR Dose 1',
    'MR Dose 2',
    'Total',
  ],
  columns: ['Childhood Immunization Services'],
  cells: buildSingleColumnTableCells({ prefix: 'IMMS', start: 11, end: 22, addColumnTotal: true }),
  id: 'TO_RH_Validation_IMMS03',
};

//------------------------------------------------------------------------------

const tableIMMS04 = {
  rows: ['Td Dose 1', 'Td Dose 2', 'Td Dose 3', 'Td Dose 4', 'Td Dose 5', 'Td Dose 6', 'Total'],
  columns: ['Maternal Immunization Services'],
  cells: buildSingleColumnTableCells({ prefix: 'IMMS', start: 24, end: 29, addColumnTotal: true }),
  id: 'TO_RH_Validation_IMMS04',
};

//------------------------------------------------------------------------------

const tableIMMS05 = {
  rows: ['BCG', 'Hep B', 'DPT/HepB/HIB', 'IPV', 'OPV', 'DPT', 'Td', 'MR', 'Total'],
  columns: ['Other Immunization Services'],
  cells: buildSingleColumnTableCells({ prefix: 'IMMS', start: 31, end: 38, addColumnTotal: true }),
  id: 'TO_RH_Validation_IMMS05',
};

//------------------------------------------------------------------------------

const tableIMMS_02 = {
  rows: [
    'Number of Primary Schools',
    'Number of Primary School Students Eligible for DPT',
    'Number of High Schools',
    'Number of High School Students Eligible for Td',
  ],
  columns: ['Number'],
  cells: buildSingleColumnTableCells({ prefix: 'IMMS', start: 6, end: 9 }),
  id: 'TO_RH_Validation_IMMS_02',
};

//------------------------------------------------------------------------------

const tableIMMS_08 = {
  rows: [
    'Total Number of Eligible School Entry Students 5-6 years old to be Immunized',
    'Number of Eligible School Entry Students 5-6 years old Immunized with DPT5',
    'Total Number of Eligible School Entry Students >7 years old to be Immunized with Td',
    'Number of Eligible School Entry Students >7 years old Immunized with Td (Annual)',
    'Total Number of Eligible High School Students Leaving School',
    'Number of Eligible High School Students Immunized with Td',
  ],
  columns: ['Number'],
  cells: [['IMMS78'], ['IMMS79'], ['IMMS79_1'], ['IMMS79_2'], ['IMMS80'], ['IMMS81']],
  id: 'TO_RH_Validation_IMMS_08',
};

//------------------------------------------------------------------------------

const tableMCH01 = {
  rows: [
    'Antepartum Bleeding',
    'Pre-existing Hypertension',
    'Pregnancy Induced Hypertension',
    'Pre-existing Diabetes',
    'Gestational Diabetes',
    'Teenage Pregnancy  (≤19 years)',
    '36 years or older',
    'Babies less than 2 years apart',
    'More than 4 children',
    'Anemic Pregnancy (<11g/dl)',
    'Other Conditions',
    'Total number of high risk pregnancies',
  ],
  columns: ['Nature of High Risk'],
  cells: [
    ...buildSingleColumnTableCells({ prefix: 'MCH', start: 3, end: 14, skipCells: [4] }),
    ['MCH2'],
  ],
  id: 'TO_RH_Validation_MCH01',
};

//------------------------------------------------------------------------------

const tableMCH07 = {
  rows: [
    'School Health',
    'Family Planning',
    'Child Health',
    'Adolescent / Youth Health',
    'Antenatal',
    'Postnatal',
    'Exclusive Breastfeeding',
    'Immunization',
    'Sexual Health',
    'Communicable Diseases',
    'Non-communicable Diseases',
    'Total Number of Sessions',
  ],
  columns: ['Health Promotion Session'],
  cells: [...buildSingleColumnTableCells({ prefix: 'MCH', start: 110, end: 120 }), ['MCH109_1']],
  id: 'TO_RH_Validation_MCH07',
};

//------------------------------------------------------------------------------

const tableMCH_02 = {
  rows: [
    'Annual Total Pregnancies: <15 years',
    'Annual Total Pregnancies: 15-19 years',
    'Annual Total Pregnancies: 20-24 years',
    'Annual Total Pregnancies: 25-29 years',
    'Annual Total Pregnancies: 30-34 years',
    'Annual Total Pregnancies: 35-39 years',
    'Annual Total Pregnancies: 40-44 years',
    'Annual Total Pregnancies: 45 + years',
    'Total',
  ],
  columns: ['Number of Pregnancies'],
  cells: buildSingleColumnTableCells({ prefix: 'MCH', start: 16, end: 23, addColumnTotal: true }),
  id: 'TO_RH_Validation_MCH_02',
};

//------------------------------------------------------------------------------

const tablePOP_01_Households = {
  rows: ['Annual Population: Total Households'],
  columns: ['Number'],
  cells: buildSingleColumnTableCells({ prefix: 'POP', start: 42, end: 42 }),
  id: 'TO_RH_Validation_POP_01_Households',
};

//------------------------------------------------------------------------------

const tablePOP_02 = {
  rows: [
    'Maternal Deaths',
    'Abortion',
    'Perinatal Period Stillbirth Deaths',
    'Perinatal Period Early Neonatal Deaths',
    'Late Neonatal Deaths',
  ],
  columns: ['Total Number'],
  cells: buildSingleColumnTableCells({ prefix: 'POP0', start: 47, end: 51 }),
  id: 'TO_RH_Validation_POP_02',
};

//------------------------------------------------------------------------------
// Table From Data Element Group Migrations
//------------------------------------------------------------------------------

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

const tableFP_01 = {
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

//------------------------------------------------------------------------------

const tFP_02Rows = [
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

const tFP_02Cols = ['15-19', '20-24', '25-29', '30-34', '35-39', '40-44', '45-49'];

const tableFP_02 = {
  rows: tFP_02Rows,
  columns: tFP_02Cols,
  cells: build2DTableCells({
    prefix: 'FP',
    numRows: tFP_02Rows.length,
    numCols: tFP_02Cols.length,
    startCell: 70,
    addColumnTotal: true,
    skipCells: [
      77,
      78,
      86,
      87,
      95,
      96,
      104,
      105,
      113,
      114,
      122,
      123,
      131,
      132,
      140,
      141,
      149,
      150,
      158,
      159,
    ],
  }),
  id: 'TO_RH_Validation_FP_02',
};

//------------------------------------------------------------------------------

const tIMMS_06Rows = [
  'BCG Infant',
  'Hep B Birth Dose',
  'DPT/HepB/HIB Dose 1',
  'DPT/HepB/HIB Dose 2',
  'DPT/HepB/HIB Dose 3',
  'IPV Dose 1',
  'OPV Dose 1',
  'OPV Dose 2',
  'OPV Dose 3',
  'DPT Dose 4',
  'MR Dose 1',
  'MR Dose 2',
  'Total',
];

const tIMMS_06Cols = ['Target Population', 'NumberImmunized'];

const tableIMMS_06 = {
  rows: tIMMS_06Rows,
  columns: tIMMS_06Cols,
  cells: build2DTableCells({
    prefix: 'IMMS',
    numRows: tIMMS_06Rows.length,
    numCols: tIMMS_06Cols.length,
    startCell: 40,
    addColumnTotal: true,
  }),
  id: 'TO_RH_Validation_IMMS_06',
};

//------------------------------------------------------------------------------

const tIMMS_07Rows = ['Td 1', 'Td 2', 'Td 3', 'Td 4', 'Td 5', 'Td 6', 'Totals'];

const tIMMS_07Cols = ['Target Population', 'NumberImmunized'];

const tableIMMS_07 = {
  rows: tIMMS_07Rows,
  columns: tIMMS_07Cols,
  cells: build2DTableCells({
    prefix: 'IMMS',
    numRows: tIMMS_07Rows.length,
    numCols: tIMMS_07Cols.length,
    startCell: 65,
    addColumnTotal: true,
  }),
  id: 'TO_RH_Validation_IMMS_07',
};

//------------------------------------------------------------------------------

const tMCH03CategorisedRows = [
  {
    category: 'Clinic Visit Service Types',
    rows: [
      'Antenatal',
      'Postnatal',
      'Newborn (under 7 days)',
      '7-28 days',
      '1 to <12 Months',
      'Pre School',
      'School Age',
      'Adolescents',
      'Hospital Referral',
      'Family Planning',
      'Other',
      'Totals',
    ],
  },
  {
    category: 'Home Visit Service Types',
    rows: [
      'Antenatal',
      'Postnatal',
      'Newborn (under 7 days)',
      '7-28 days',
      '1 to <12 Months',
      'Pre School',
      'School Age',
      'Adolescents',
      'Hospital Referral',
      'Home Sanitation',
      'Family Planning',
      'Other',
      'Totals',
    ],
  },
];

const tMCH03Cols = ['New Visits', 'Visits', 'Totals'];

const tMCH03UndefinedCells = [
  { rowIndex: 5, colIndex: 0 },
  { rowIndex: 6, colIndex: 0 },
  { rowIndex: 7, colIndex: 0 },
  { rowIndex: 8, colIndex: 0 },
  { rowIndex: 9, colIndex: 0 },
  { rowIndex: 10, colIndex: 0 },
  { rowIndex: 11, colIndex: 0 },
];

const tableMCH03 = {
  rows: tMCH03CategorisedRows,
  columns: tMCH03Cols,
  cells: [
    ...build2DTableCells({
      prefix: 'MCH',
      numRows: tMCH03CategorisedRows[0].rows.length - 1,
      numCols: tMCH03Cols.length,
      startCell: 42,
      insertCells: [
        { name: 'MCH42_1', rowIndex: 0, colIndex: 1 },
        { name: 'MCH43_1', rowIndex: 1, colIndex: 1 },
        ...tMCH03UndefinedCells,
      ],
      addRowTotal: true,
    }),
    ['$rowCategoryColumnTotal', '$rowCategoryColumnTotal', '$rowCategoryTotal'],
    ...build2DTableCells({
      prefix: 'MCH',
      numRows: tMCH03CategorisedRows[1].rows.length - 1,
      numCols: tMCH03Cols.length,
      startCell: 25,
      insertCells: [
        { name: 'MCH25_1', rowIndex: 0, colIndex: 1 },
        { name: 'MCH26_1', rowIndex: 1, colIndex: 1 },
        ...tMCH03UndefinedCells,
      ],
      addRowTotal: true,
    }),
    ['$rowCategoryColumnTotal', '$rowCategoryColumnTotal', '$rowCategoryTotal'],
  ],
  id: 'TO_RH_Validation_MCH03',
};

//------------------------------------------------------------------------------

const tMCH05Rows = ['Number of Mothers Interviewed', 'Number Exclusively Breastfeeding'];

const tMCH05Cols = ['Male', 'Female', 'Totals'];

const tMCH05CategorisedCols = [
  {
    category: '4 months',
    columns: tMCH05Cols,
  },
  {
    category: '6 months',
    columns: tMCH05Cols,
  },
];

const tMCH05Cells = [
  ['MCH58', 'MCH59', '$columnCategoryRowTotal', 'MCH66', 'MCH67', '$columnCategoryRowTotal'],
  ['MCH60', 'MCH61', '$columnCategoryRowTotal', 'MCH68', 'MCH69', '$columnCategoryRowTotal'],
];

const tableMCH05 = {
  rows: tMCH05Rows,
  columns: tMCH05CategorisedCols,
  cells: tMCH05Cells,
  id: 'TO_RH_Validation_MCH05',
};

//------------------------------------------------------------------------------

const tMCH_08Rows = ['Attended', 'Did not attend'];

const tMCH_08Cols = [
  '<15 years',
  '15-19 years',
  '20-24 years',
  '25-29 years',
  '30-34 years',
  '35-39 years',
  '40-44 years',
  '45 + years',
  'Totals',
];

const tableMCH_08 = {
  rows: tMCH_08Rows,
  columns: tMCH_08Cols,
  cells: build2DTableCells({
    prefix: 'MCH',
    numRows: tMCH_08Rows.length,
    numCols: tMCH_08Cols.length,
    startCell: 122,
    addRowTotal: true,
  }),
  id: 'TO_RH_Validation_MCH_08',
};

//------------------------------------------------------------------------------

const tPOP_01Rows = [
  'Infants (<1 yr)',
  '1-4 years',
  '5-9 years',
  '10-14 years',
  '15-19 years',
  '20-24 years',
  '25-29 years',
  '30-34 years',
  '35-39 years',
  '40-44 years',
  '45-49 years',
  '50-54 years',
  '55-59 years',
  '60-64 years',
  '65-69 years',
  '70-74 years',
  '75-79 years',
  '80 + years',
  'Migration Out >6/12',
  'Migration In >6/12',
];

const tPOP_01Cols = ['Male', 'Female'];

const tablePOP_01 = {
  rows: tPOP_01Rows,
  columns: tPOP_01Cols,
  cells: [
    ...build2DTableCells({
      prefix: 'POP0',
      numRows: 4,
      numCols: tPOP_01Cols.length,
      startCell: 2,
    }),
    ...build2DTableCells({
      prefix: 'POP',
      numRows: tPOP_01Rows.length - 4,
      numCols: tPOP_01Cols.length,
      startCell: 10,
    }),
  ],
  id: 'TO_RH_Validation_POP_01',
};

//------------------------------------------------------------------------------

const tPOP_03Rows = [
  'Infants (<1 yr)',
  '1-4 years',
  '5-9 years',
  '10-14 years',
  '15-19 years',
  '20-24 years',
  '25-29 years',
  '30-34 years',
  '35-39 years',
  '40-44 years',
  '45-49 years',
  '50-54 years',
  '55-59 years',
  '60-64 years',
  '65-69 years',
  '70-74 years',
  '75-79 years',
  '80 + years',
];

const tPOP_03Cols = ['Male', 'Female'];

const tablePOP_03 = {
  rows: tPOP_03Rows,
  columns: tPOP_03Cols,
  cells: build2DTableCells({
    prefix: 'POP0',
    numRows: tPOP_03Rows.length,
    numCols: tPOP_03Cols.length,
    startCell: 54,
  }),
  id: 'TO_RH_Validation_POP_03',
};

//------------------------------------------------------------------------------

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
    ${convertToTableOfDataValuesSql(tableFP_03)}
    ${convertToTableOfDataValuesSql(tableIMMS01)}
    ${convertToTableOfDataValuesSql(tableIMMS03)}
    ${convertToTableOfDataValuesSql(tableIMMS04)}
    ${convertToTableOfDataValuesSql(tableIMMS05)}
    ${convertToTableOfDataValuesSql(tableIMMS_02)}
    ${convertToTableOfDataValuesSql(tableIMMS_08)}
    ${convertToTableOfDataValuesSql(tableMCH01)}
    ${convertToTableOfDataValuesSql(tableMCH07)}
    ${convertToTableOfDataValuesSql(tableMCH_02)}
    ${convertToTableOfDataValuesSql(tablePOP_01_Households)}
    ${convertToTableOfDataValuesSql(tablePOP_02)}

    ${convertToTableOfDataValuesSql(tableFP_01)}
    ${convertToTableOfDataValuesSql(tableFP_02)}
    ${convertToTableOfDataValuesSql(tableIMMS_06)}
    ${convertToTableOfDataValuesSql(tableIMMS_07)}
    ${convertToTableOfDataValuesSql(tableMCH03)}
    ${convertToTableOfDataValuesSql(tableMCH05)}
    ${convertToTableOfDataValuesSql(tableMCH_08)}
    ${convertToTableOfDataValuesSql(tablePOP_01)}
    ${convertToTableOfDataValuesSql(tablePOP_03)}
  `);
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
