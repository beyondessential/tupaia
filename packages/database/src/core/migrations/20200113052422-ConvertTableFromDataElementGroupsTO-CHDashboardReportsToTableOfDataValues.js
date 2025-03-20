import { build2DTableCells } from '../utilities/migration';

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

const t1Rows = [
  'Prediabetes',
  'Newly Diagnosed Cases: DM Only',
  'Newly Diagnosed Cases: HTN Only',
  'Newly Diagnosed Cases: DM/HTN',
  'Total Diagnosed Cases: DM Only',
  'Total Diagnosed Cases: HTN Only',
  'Total Diagnosed Cases: DM/HTN',
  'Total Diagnosed Cases: Asthma',
  'Total Diagnosed Cases: Cancer',
  'Total Diagnosed Cases: Cerebral Vascular Accident',
  'Total Diagnosed Cases: Chronic Kidney Disease',
  'Total Diagnosed Cases: Dyslipidemia',
  'Total Diagnosed Cases: Gout',
  'Total Diagnosed Cases: Ischemic Heart Disease',
  'Total Diagnosed Cases: RHD',
];
const t1Cols = [
  'Males <25',
  'Females <25',
  'Males 25-34',
  'Females 25-34',
  'Males 35-44',
  'Females 35-44',
  'Males 45-54',
  'Females 45-54',
  'Males 55-64',
  'Females 55-64',
  'Males 65-74',
  'Females 65-74',
  'Males 75+',
  'Females 75+',
  'Totals',
];

const table1 = {
  rows: t1Rows,
  columns: t1Cols,
  cells: build2DTableCells({
    prefix: 'CH',
    numRows: t1Rows.length,
    numCols: t1Cols.length,
    startCell: 15,
    skipCells: [169, 170, 171, 172, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182],
    addRowTotal: true,
  }),
  id: 'TO_CH_Validation_CH1',
};

const t5Rows = [
  'Health Center NCD Clinic',
  'Lifestyle Clinic',
  'NDC Outreach Clinic',
  'Medical Outreach Clinic',
];

const t5Cols = [
  'Number of Clinics Done in Month',
  'Booking',
  'Booked Attendance',
  'Unbooked Attendance ',
  'Did Not Attend',
  'Defaulters',
  'Totals',
];

const table5 = {
  rows: t5Rows,
  columns: t5Cols,
  cells: build2DTableCells({
    prefix: 'CH',
    numRows: t5Rows.length,
    numCols: t5Cols.length,
    startCell: 299,
    addRowTotal: true,
  }),
  id: 'TO_CH_Validation_CH5',
};

const t9Rows = [
  'Diseases of the nervous system',
  'Diseases of the eye and adnexa',
  'Diseases of the ear and mastoid process',
  'Diseases of the circulatory system',
  'Diseases of the respiratory system',
  'Diseases of the digestive system',
  'Diseases of the skin and subcutaneous tissue',
  'Diseases of the musculoskeletal system and connective tissue',
  'Diseases of the genitourinary system',
  'Dental',
  'Injury, poisoning and accident',
  'Mental and behavioral Disorder',
  'Admin (letter/ sick sheet etc',
  'Refill Medication',
  'Totals',
];

const t9Cols = ['Count'];

const table9 = {
  rows: t9Rows,
  columns: t9Cols,
  cells: build2DTableCells({
    prefix: 'CH',
    numRows: t9Rows.length,
    numCols: t9Cols.length,
    startCell: 621,
    addColumnTotal: true,
  }),
  id: 'TO_CH_Validation_CH9',
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
    ${convertToTableOfDataValuesSql(table1)}
    ${convertToTableOfDataValuesSql(table5)}
    ${convertToTableOfDataValuesSql(table9)}
  `);
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
