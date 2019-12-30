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
    elements.push(`Tonga_CD${i}`);
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

const getReportColumns = () => {
  const columns = getReportColumnsInRange(2, 8);
  columns['Tonga_CD9'] = { additionalData: ['Tonga_CD10'] };
  columns['Tonga_CD11'] = { additionalData: ['Tonga_CD12'] };
  columns['Tonga_CD13'] = {};
  columns['Tonga_CD14'] = {};
  columns['Tonga_CD15'] = { additionalData: ['Tonga_CD16'] };
  columns['Tonga_CD17'] = {
    additionalData: getDataElementsInRange(18, 22),
    shouldNumberLines: true,
    title: 'Organism Sensitivity',
  };
  columns['Tonga_CD23'] = {
    additionalData: getDataElementsInRange(24, 28),
    shouldNumberLines: true,
    title: 'Organism Resistance',
  };
  columns['Tonga_CD29'] = {
    additionalData: getDataElementsInRange(30, 31),
    shouldNumberLines: true,
    title: 'Organism S/R Indeterminate',
  };
  columns['Tonga_CD32'] = {
    additionalData: ['Tonga_CD33'],
    shouldNumberLines: true,
    title: 'Organism S/R Out of Stock',
  };

  return columns;
};

const STRIP_FROM_COLUMN_NAMES = 'CD1';
const PROGRAM_CODE = 'Tonga_CD1';
const REPORT_COLUMNS = getReportColumns();
const REPORT_ID = 'TO_CD_Validation_CD1';
const REPORT_NAME = 'Notifiable Diseases (Excluding STIs and HIV)';

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
