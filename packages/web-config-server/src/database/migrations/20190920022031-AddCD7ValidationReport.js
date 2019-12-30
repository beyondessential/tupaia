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

const REPORT_ID = 'TO_CD_Validation_CD7';
const REPORT_NAME = 'Monthly Medical Certificate';

exports.up = async function(db) {
  await insertObject(db, 'dashboardReport', {
    id: REPORT_ID,
    dataBuilder: 'tableFromDataElementGroups',
    dataBuilderConfig: {
      stripFromRowCategoryNames: '.*- ',
      stripFromRowNames: '.*- ',
      stripFromColumnNames: '.*- ',
      rowDataElementGroupSets: [
        'CD7_Rows_A_Certificates_Issued',
        'CD7_Rows_B_Missionary',
        'CD7_Rows_C_Visa',
        'CD7_Rows_D_Employment',
      ],
      columnDataElementGroupSets: ['CD7_Columns_Number'],
      shouldShowTotalsRow: true,
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
      "dashboardReports" = "dashboardReports" || '{ ${REPORT_ID} }'
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
