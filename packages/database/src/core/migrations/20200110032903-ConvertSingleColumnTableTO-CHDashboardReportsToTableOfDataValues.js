/* eslint-disable func-names */
import { buildSingleColumnTableCells } from '../utilities/migration';

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

const table1b = {
  rows: [
    'DM II and HTN: Total Number of Screening Encounters',
    'DM II and HTN: Number of Unique Patients Screened',
    'Annual NCD Screening RHD: Total Screened',
    'Annual NCD Screening RHD: Total Borderline Cases',
    'Annual NCD Screening RHD: Total Positive Cases',
    'Annual NCD Screening RHD: Total Referred to Specialist',
    'Annual NCD Screening RHD: Total Starting Benzathine',
    'CH1 Annual NCD Screening and Diagnosis: Number Transfer Out',
    'CH1 Annual NCD Screening and Diagnosis: Number Transfer In',
    'CH1 Annual NCD Screening and Diagnosis: Number of Deaths of NCD Patient',
  ],
  columns: ['Count'],
  cells: [
    ['CH2'],
    ['CH3'],
    ['CH10'],
    ['CH11'],
    ['CH12'],
    ['CH13'],
    ['CH14'],
    ['CH239'],
    ['CH240'],
    ['CH241'],
  ],
  id: 'TO_CH_Validation_CH1b',
};

const table2a = {
  rows: [
    'CH2A Annual DM II HTN Screening: Total Number of Clients Assessed',
    'HBa1c: Excellent (≤ 6.5%)',
    'HBa1c: Good (6.6% to 7.9%)',
    'HBa1c: Less than ideal (8% to 9%)',
    'HBa1c: Poor (9.1% to 9.9%)',
    'HBa1c: Very poor (≥10%)',
    'eGFR ≥60 (CKD Normal)',
    'eGFR 30-59 (CKD 3)',
    'eGFR 15-29 (CKD 4)',
    'eGFR <15 (CKD 5)',
    'Fasting Cholesterol Level: < 5.2 mmol/L',
    'Fasting Cholesterol Level: 5.2 mmol/L or higher',
    'Eye Check: Normal',
    'Eye Check: Abnormal',
    'Foot Check: At Risk (Normal)',
    'Foot Check: Risk',
    'Foot Check: High Risk',
  ],
  columns: ['Count'],
  cells: buildSingleColumnTableCells({ prefix: 'CH', start: 243, end: 259 }),
  id: 'TO_CH_Validation_CH2a',
};

const table2b = {
  rows: [
    'Number of Complications Screening Tests: Hba1c Test',
    'Number of Complications Screening Tests: Kidney Function Test',
    'Number of Complications Screening Tests: Lipid Profile',
    'Number of Complications Screening Tests: Eye Check',
    'Number of Complications Screening Tests: Foot Check',
  ],
  columns: ['Count'],
  cells: buildSingleColumnTableCells({ prefix: 'CH', start: 261, end: 265 }),
  id: 'TO_CH_Validation_CH2b',
};

const table3 = {
  rows: [
    'DM Medication: Daonil',
    'DM Medication: Glipizide',
    'DM Medication: Insulin',
    'DM Medication: Metformin',
    'DM Medication: Refuse Rx',
    'DM Medication: Lifestyle',
    'DM Medication: Other',
    'DM Medication Combinations: Oral medicine only',
    'DM Medication Combinations: Oral medicine plus Insulin',
    'DM Medication Combinations: Insulin only',
    'HT Medication: ACE Inhibitor',
    'HT Medication: Beta Blocker',
    'HT Medication: Calcium Channel Blocker',
    'HT Medication: Frusemide',
    'HT Medication: HCT',
    'HT Medication: Refuse Rx',
    'CVD Risk-Lowering Medication: Aspirin',
    'CVD Risk-Lowering Medication: Statin',
  ],
  columns: ['Count'],
  cells: buildSingleColumnTableCells({ prefix: 'CH', start: 267, end: 284 }),
  id: 'TO_CH_Validation_CH3',
};

const table6 = {
  rows: [
    'Dressings Done - Male',
    'Dressings Done - Female',
    'Diabetes Patients Dressed',
    'After Hours Dressing',
    'Peki Mate Dressing',
    'Special Dressings (e.g suture, circumcision)',
    'Other Services: Nebuliser/Puffer',
    'Other Services: After Hours Nebuliser/Puffer',
    'Other Services: Benzathine Injection',
    'Other Services: After Hours Benzathine Injection',
    'Other Services: Default Benzathine Injection',
  ],
  columns: ['Count'],
  cells: buildSingleColumnTableCells({ prefix: 'CH', start: 324, end: 334 }),
  id: 'TO_CH_Validation_CH6',
};

const table7 = {
  rows: [
    'Total Patients for Home Visit',
    'Number of Patients Visited at Home',
    'Home Visit: New Cases',
    'Discharge from Home Visit Lists',
    'Total Patients for Home Dressing',
    'Home Dressing: New Cases',
    'Number of Dressings Done at Home',
    'Discharged from Home Dressing List',
    'School Visits - Health Promotion (Health Talk and Inspection)',
    'School Visits - Screening',
    'Community Visit - Health Promotion (Health Talk and Inspection)',
    'Community Visit - Screening',
  ],
  columns: ['Count'],
  cells: buildSingleColumnTableCells({ prefix: 'CH', start: 336, end: 347 }),
  id: 'TO_CH_Validation_CH7',
};

const table8 = {
  rows: [
    'Number of Consultations: Working Hours',
    'Number of Consultations: After Hours',
    'Number of Consultations by Gender: Female',
    'Number of Consultations by Gender: Male',
    'Number of Consultations by Age Group: < 1 yr',
    'Number of Consultations by Age Group: 1-4 yrs',
    'Number of Consultations by Age Group: 5-9 yrs',
    'Number of Consultations by Age Group: 10-14 yrs',
    'Number of Consultations by Age Group: 15-19 yrs',
    'Number of Consultations by Age Group: 20-24 yrs',
    'Number of Consultations by Age Group: 25-29 yrs',
    'Number of Consultations by Age Group: 30-39 yrs',
    'Number of Consultations by Age Group: 40-49 yrs',
    'Number of Consultations by Age Group: 50-59 yrs',
    'Number of Consultations by Age Group: 60-69 yrs',
    'Number of Consultations by Age Group: 70+ yrs',
  ],
  columns: ['Count'],
  cells: buildSingleColumnTableCells({ prefix: 'CH', start: 349, end: 364 }),
  id: 'TO_CH_Validation_CH8',
};

const table10 = {
  rows: [
    'Clinic Attendance: Number of Bookings',
    'Clinic Attendance: Booking Attendance',
    'Clinic Attendance: Hypertension Attend',
    'Clinic Attendance: Unbook Attend',
    'Clinic Attendance: Did Not Attend',
    'Clinic Attendance: Did Not Attend But Contacted',
    'Clinic Attendance: Defaulters',
    'Clinic Attendance: Postnatal Attend',
    'Clinic Attendance: Consultation',
    'Clinic Attendance: Missing Chart',
    'Clinic Attendance: Lifestyle/Diet Bookings',
    'Clinic Attendance: L/D Attend',
    'Clinic Attendance: L/D Did Not Attend',
    'Clinic Attendance: Screening Encounters',
    'Clinic Attendance: Fasting Blood Sugar (FBS) ≥ 7',
    'Clinic Attendance: Fasting Blood Sugar (FBS) 6-6.9',
    'Clinic Attendance: Newly Diagnosed',
    'Clinic Attendance: Refill Medication Chart',
    'Clinic Attendance: Lost Card',
    'Clinic Attendance: Refer in',
    'Clinic Attendance: Transfer in',
    'Clinic Attendance: Transfer out',
    'Clinic Attendance: Dental Vital Check',
    'Clinic Attendance: Foot Check Bookings',
    'Clinic Attendance: Foot Check Done',
    'Clinic Attendance: Insulin Training',
    'Clinic Attendance: Hba1c% at NDC',
    'Clinic Attendance: Cr/Lipid/a1c Blood Form',
    'Clinic Attendance: ACR Urine Form',
    'Clinic Attendance: Eye Check Form',
    'Clinic Attendance: Admission',
    'Total Dressings - Male',
    'Total Dressings - Female',
    'Foot and Wound: Carbuncle',
    'Foot and Wound: Diabetic Foot Sepsis',
    'Foot and Wound: Other Wound',
    'Foot and Wound: Footcare',
    'Foot and Wound: Pus Swab',
    'Foot and Wound: MRSA Result Positive',
    'Foot and Wound: Xray',
    'Amputation: Toe',
    'Amputation: Forefoot',
    'Amputation: Midfoot',
    'Amputation: Below knee',
    'Amputation: Above knee',
  ],
  columns: ['Count'],
  cells: buildSingleColumnTableCells({ prefix: 'CH', start: 405, end: 449 }),
  id: 'TO_CH_Validation_CH10',
};

const table12 = {
  rows: [
    'OGTT: Total Booking',
    'OGTT: Unbook',
    'OGTT: Total OGTT',
    'OGTT: Total Test',
    'OGTT: Rebook',
    'OGTT: Did Not Attend',
    'OGTT: Positive GDM',
    'OGTT: Pre-GDM',
    'Postnatal GDM: Total Postnatal Follow-Up',
    'Postnatal GDM: Total Attend',
    'Postnatal GDM: Did Not Attend',
    'Postnatal GDM: FBS ≥ 6 mmol/l',
    'Postnatal GDM: HbA1c% ≥ 6.5%',
    'Postnatal GDM: Did Not Attend but able to contact and re-book',
  ],
  columns: ['Count'],
  cells: buildSingleColumnTableCells({ prefix: 'CH', start: 606, end: 619 }),
  id: 'TO_CH_Validation_CH12',
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
    ${convertToTableOfDataValuesSql(table1b)}
    ${convertToTableOfDataValuesSql(table2a)}
    ${convertToTableOfDataValuesSql(table2b)}
    ${convertToTableOfDataValuesSql(table3)}
    ${convertToTableOfDataValuesSql(table6)}
    ${convertToTableOfDataValuesSql(table7)}
    ${convertToTableOfDataValuesSql(table8)}
    ${convertToTableOfDataValuesSql(table10)}
    ${convertToTableOfDataValuesSql(table12)}
  `);
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
