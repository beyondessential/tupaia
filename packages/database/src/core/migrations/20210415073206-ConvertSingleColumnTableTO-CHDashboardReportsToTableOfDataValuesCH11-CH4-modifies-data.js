/* eslint-disable func-names */

'use strict';

import { buildSingleColumnTableCells } from '../utilities/migration';

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

const table11 = {
  rows: [
    'CH11 Number Screened: 10-19 years male',
    'CH11 Number Screened: 10-19 years female',
    'CH11 Number Screened: 20-29 years male',
    'CH11 Number Screened: 20-29 years female',
    'CH11 Number Screened: 30-59 years male',
    'CH11 Number Screened: 30-59 years female',
    'CH11 Number Screened: 60 + years male',
    'CH11 Number Screened: 60 + years female',
    'CVD Risk: Green <10% - 10-19 years male',
    'CVD Risk: Green <10% - 10-19 years female',
    'CVD Risk: Green <10% - 20-29 years male',
    'CVD Risk: Green <10% - 20-29 years female',
    'CVD Risk: Green <10% - 30-59 years male',
    'CVD Risk: Green <10% - 30-59 years female',
    'CVD Risk: Green <10% - 60 + years male',
    'CVD Risk: Green <10% - 60 + years female',
    'CVD Risk: Yellow 10% to <20% - 10-19 years male',
    'CVD Risk: Yellow 10% to <20% - 10-19 years female',
    'CVD Risk: Yellow 10% to <20% - 20-29 years male',
    'CVD Risk: Yellow 10% to <20% - 20-29 years female',
    'CVD Risk: Yellow 10% to <20% - 30-59 years male',
    'CVD Risk: Yellow 10% to <20% - 30-59 years female',
    'CVD Risk: Yellow 10% to <20% - 60 + years male',
    'CVD Risk: Yellow 10% to <20% - 60 + years female',
    'CVD Risk: Orange 20% to <30% - 10-19 years male',
    'CVD Risk: Orange 20% to <30% - 10-19 years female',
    'CVD Risk: Orange 20% to <30% - 20-29 years male',
    'CVD Risk: Orange 20% to <30% - 20-29 years female',
    'CVD Risk: Orange 20% to <30% - 30-59 years male',
    'CVD Risk: Orange 20% to <30% - 30-59 years female',
    'CVD Risk: Orange 20% to <30% - 60 + years male',
    'CVD Risk: Orange 20% to <30% - 60 + years female',
    'CVD Risk: Red 30% to <40% - 10-19 years male',
    'CVD Risk: Red 30% to <40% - 10-19 years female',
    'CVD Risk: Red 30% to <40% - 20-29 years male',
    'CVD Risk: Red 30% to <40% - 20-29 years female',
    'CVD Risk: Red 30% to <40% - 30-59 years male',
    'CVD Risk: Red 30% to <40% - 30-59 years female',
    'CVD Risk: Red 30% to <40% - 60 + years male',
    'CVD Risk: Red 30% to <40% - 60 + years female',
    'CVD Risk: Deep Red ≥40% - 10-19 years male',
    'CVD Risk: Deep Red ≥40% - 10-19 years female',
    'CVD Risk: Deep Red ≥40% - 20-29 years male',
    'CVD Risk: Deep Red ≥40% - 20-29 years female',
    'CVD Risk: Deep Red ≥40% - 30-59 years male',
    'CVD Risk: Deep Red ≥40% - 30-59 years female',
    'CVD Risk: Deep Red ≥40% - 60 + years male',
    'CVD Risk: Deep Red ≥40% - 60 + years female',
    'Overweight: 10-19 years male',
    'Overweight: 10-19 years female',
    'Overweight: 20-29 years male',
    'Overweight: 20-29 years female',
    'Overweight: 30-59 years male',
    'Overweight: 30-59 years female',
    'Overweight: 60 + years male',
    'Overweight: 60 + years female',
    'Class 1 Obesity: 10-19 years male',
    'Class 1 Obesity: 10-19 years female',
    'Class 1 Obesity: 20-29 years male',
    'Class 1 Obesity: 20-29 years female',
    'Class 1 Obesity: 30-59 years male',
    'Class 1 Obesity: 30-59 years female',
    'Class 1 Obesity: 60 + years male',
    'Class 1 Obesity: 60 + years female',
    'Class 2 Obesity: 10-19 years male',
    'Class 2 Obesity: 10-19 years female',
    'Class 2 Obesity: 20-29 years male',
    'Class 2 Obesity: 20-29 years female',
    'Class 2 Obesity: 30-59 years male',
    'Class 2 Obesity: 30-59 years female',
    'Class 2 Obesity: 60 + years male',
    'Class 2 Obesity: 60 + years female',
    'Class 3 Obesity: 10-19 years male',
    'Class 3 Obesity: 10-19 years female',
    'Class 3 Obesity: 20-29 years male',
    'Class 3 Obesity: 20-29 years female',
    'Class 3 Obesity: 30-59 years male',
    'Class 3 Obesity: 30-59 years female',
    'Class 3 Obesity: 60 + years male',
    'Class 3 Obesity: 60 + years female',
    'Borderline Fasting Blood Sugar: 10-19 years male',
    'Borderline Fasting Blood Sugar: 10-19 years female',
    'Borderline Fasting Blood Sugar: 20-29 years male',
    'Borderline Fasting Blood Sugar: 20-29 years female',
    'Borderline Fasting Blood Sugar: 30-59 years male',
    'Borderline Fasting Blood Sugar: 30-59 years female',
    'Borderline Fasting Blood Sugar: 60 + years male',
    'Borderline Fasting Blood Sugar: 60 + years female',
    'High Fasting Blood Sugar: 10-19 years male',
    'High Fasting Blood Sugar: 10-19 years female',
    'High Fasting Blood Sugar: 20-29 years male',
    'High Fasting Blood Sugar: 20-29 years female',
    'High Fasting Blood Sugar: 30-59 years male',
    'High Fasting Blood Sugar: 30-59 years female',
    'High Fasting Blood Sugar: 60 + years male',
    'High Fasting Blood Sugar: 60 + years female',
    'Moderate High Blood Pressure: 10-19 years male',
    'Moderate High Blood Pressure: 10-19 years female',
    'Moderate High Blood Pressure: 20-29 years male',
    'Moderate High Blood Pressure: 20-29 years female',
    'Moderate High Blood Pressure: 30-59 years male',
    'Moderate High Blood Pressure: 30-59 years female',
    'Moderate High Blood Pressure: 60 + years male',
    'Moderate High Blood Pressure: 60 + years female',
    'Very High Blood Pressure: 10-19 years male',
    'Very High Blood Pressure: 10-19 years female',
    'Very High Blood Pressure: 20-29 years male',
    'Very High Blood Pressure: 20-29 years female',
    'Very High Blood Pressure: 30-59 years male',
    'Very High Blood Pressure: 30-59 years female',
    'Very High Blood Pressure: 60 + years male',
    'Very High Blood Pressure: 60 + years female',
    'Smokers: 10-19 years male',
    'Smokers: 10-19 years female',
    'Smokers: 20-29 years male',
    'Smokers: 20-29 years female',
    'Smokers: 30-59 years male',
    'Smokers: 30-59 years female',
    'Smokers: 60 + years male',
    'Smokers: 60 + years female',
    'Alcohol Drinkers: 10-19 years male',
    'Alcohol Drinkers: 10-19 years female',
    'Alcohol Drinkers: 20-29 years male',
    'Alcohol Drinkers: 20-29 years female',
    'Alcohol Drinkers: 30-59 years male',
    'Alcohol Drinkers: 30-59 years female',
    'Alcohol Drinkers: 60 + years male',
    'Alcohol Drinkers: 60 + years female',
    'Referrals: 10-19 years male',
    'Referrals: 10-19 years female',
    'Referrals: 20-29 years male',
    'Referrals: 20-29 years female',
    'Referrals: 30-59 years male',
    'Referrals: 30-59 years female',
    'Referrals: 60 + years male',
    'Referrals: 60 + years female',
    'Family History of NCD: Yes - 10-19 years male',
    'Family History of NCD: Yes - 10-19 years female',
    'Family History of NCD: Yes - 20-29 years male',
    'Family History of NCD: Yes - 20-29 years female',
    'Family History of NCD: Yes - 30-59 years male',
    'Family History of NCD: Yes - 30-59 years female',
    'Family History of NCD: Yes - 60 + years male',
    'Family History of NCD: Yes - 60 + years female',
    'Family History of NCD: No - 10-19 years male',
    'Family History of NCD: No - 10-19 years female',
    'Family History of NCD: No - 20-29 years male',
    'Family History of NCD: No - 20-29 years female',
    'Family History of NCD: No - 30-59 years male',
    'Family History of NCD: No - 30-59 years female',
    'Family History of NCD: No - 60 + years male',
    'Family History of NCD: No - 60 + years female',
  ],
  columns: ['Count'],
  cells: buildSingleColumnTableCells({
    prefix: 'CH',
    start: 452,
    end: 604,
    skipCells: [544],
  }),
  id: 'TO_CH_Validation_CH11',
};

const table4 = {
  rows: [
    'Risk Factor (number of people): Smokers',
    'Risk Factor (number of people): Alcohol Drinkers',
    'Risk Factor (number of people): Overweight (BMI 25 to 29.9)',
    'Risk Factor (number of people): Class 1 Obesity (BMI 30.0 to 34.9)',
    'Risk Factor (number of people): Class 2 Obesity (BMI 35.0 to 39.9)',
    'Risk Factor (number of people): Class 3 Obesity (BMI ≥ 40)',
    'CVD Risk: Green <10%',
    'CVD Risk: Yellow 10% to <20%',
    'CVD Risk: Orange 20% to <30%',
    'CVD Risk: Red 30% to <40%',
    'CVD Risk: Deep Red >40%',
  ],
  columns: ['Count'],
  cells: buildSingleColumnTableCells({ prefix: 'CH', start: 287, end: 297 }),
  id: 'TO_CH_Validation_CH4',
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
    ${convertToTableOfDataValuesSql(table4)}
    ${convertToTableOfDataValuesSql(table11)}
  `);
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
