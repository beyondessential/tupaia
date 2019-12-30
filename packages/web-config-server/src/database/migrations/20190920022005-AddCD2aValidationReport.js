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

const getDataElementsInRange = (start, end) => {
  const elements = [];
  for (let i = start; i <= end; i++) {
    elements.push(`Tonga_CD2_${i}`);
  }

  return elements;
};

const getReportColumnsInRange = (start, end) => {
  const columns = {};
  getDataElementsInRange(start, end).forEach(element => {
    columns[element] = {};
  });

  return columns;
};

const STRIP_FROM_COLUMN_NAMES = 'CD2a ';
const PROGRAM_CODE = 'Tonga_CD2a';
const REPORT_COLUMNS = getReportColumnsInRange(2, 19);
delete REPORT_COLUMNS['Tonga_CD2_10'];
delete REPORT_COLUMNS['Tonga_CD2_15'];
const REPORT_ID = 'TO_CD_Validation_CD2a';
const REPORT_NAME = 'STIs - Chlamydia and Gonorrhea';

exports.up = async function(db) {
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
      "dashboardReports" = "dashboardReports" ||'{ ${REPORT_ID} }'
    WHERE
      "code" IN (
        'TO_Communicable_Diseases_Validation',
        'DL_Communicable_Diseases_Validation'
      );
  `);
};

exports.down = function(db) {
  return db.runSql(`
    DELETE FROM "dashboardReport" WHERE "id" = '${REPORT_ID}';

    UPDATE
      "dashboardGroup"
    SET
      "dashboardReports" = array_remove("dashboardReports", '${REPORT_ID}')
    WHERE
      "code" IN (
        'TO_Communicable_Diseases_Validation',
        'DL_Communicable_Diseases_Validation'
      );
  `);
};

exports._meta = {
  version: 1,
};
