'use strict';

import { insertObject } from '../migrationUtilities';

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

const REPORT_COLUMNS = {
  CD2_2: {},
  CD2_3: {},
  CD2_4: {},
  CD2_5: {},
  CD2_6: {},
  CD2_NEW001: {},
  CD2_NEW002: {},
  CD2_NEW003: {},
  CD2_8_1A8Z_1A7Z: {},
  CD2_9_1A8Z_1A7Z: {},
  CD2_11_1A8Z: {},
  CD2_12_1A8Z: {},
  CD2_13_1A8Z: {},
  CD2_16_1A7Z: {},
  CD2_17_1A7Z: {},
  CD2_18_1A7Z: {},
  CD2_27_1A6Z: {},
  CD2_28_1A6Z: {},
  CD2_29_1A6Z: {},
  CD2_30_1A6Z: {},
  CD2_40_1C62_Z: {},
  CD2_39_1C62_Z: {},
  CD2_41_1C62_Z: {},
  CD2_NEW007_1E50_1: {},
  CD2_NEW008_1E50_1: {},
  CD2_NEW009_1E50_1: {},
};

const STRIP_FROM_COLUMN_NAMES = 'CD2 ';
const PROGRAM_CODE = 'CD2';
const REPORT_ID = 'TO_CD_Validation_CD2';
const REPORT_NAME = 'STIs, HIV and Hep B';

const REPORTS_TO_DELETE = [
  'TO_CD_Validation_CD2a',
  'TO_CD_Validation_CD2b',
  'TO_CD_Validation_CD2c',
];

exports.up = async function(db) {
  await db.runSql(
    `DELETE FROM "dashboardReport" WHERE id IN (${REPORTS_TO_DELETE.map(id => `'${id}'`).join(
      ',',
    )})`,
  );

  await insertObject(db, 'dashboardReport', {
    id: REPORT_ID,
    dataBuilder: 'tableOfEvents',
    dataBuilderConfig: {
      columns: REPORT_COLUMNS,
      programCode: PROGRAM_CODE,
      stripFromColumnNames: STRIP_FROM_COLUMN_NAMES,
    },
    viewJson: {
      name: REPORT_NAME,
      type: 'chart',
      chartType: 'matrix',
      placeholder: '/static/media/PEHSMatrixPlaceholder.png',
      periodGranularity: 'one_month_at_a_time',
    },
    dataServices: [{ isDataRegional: false }],
  });

  return db.runSql(`
    UPDATE
      "dashboardGroup"
    SET
      "dashboardReports" = '{"TO_CD_Validation_CD1","TO_CD_Validation_CD2","TO_CD_Validation_CD3","TO_CD_Validation_CD4","TO_CD_Validation_CD5","TO_CD_Validation_CD6","TO_CD_Validation_CD7"}'
    WHERE
      "code" IN (
        'TO_Communicable_Diseases_Validation',
        'DL_Communicable_Diseases_Validation'
      );
  `);
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
