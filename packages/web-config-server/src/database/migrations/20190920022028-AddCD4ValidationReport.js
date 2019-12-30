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
  Tonga_CD53: {},
  Tonga_CD54: {},
  Tonga_CD55: {},
  Tonga_CD56: {},
  Tonga_CD57: {},
  Tonga_CD58: {},
  Tonga_CD59: {},
  Tonga_CD60: {},
  Tonga_CD61: {},
};
const REPORT_ID = 'TO_CD_Validation_CD4';
const REPORT_NAME = 'Isolation Ward Admissions';

exports.up = async function(db) {
  await insertObject(db, 'dashboardReport', {
    id: REPORT_ID,
    dataBuilder: 'tableOfEvents',
    dataBuilderConfig: {
      columns: REPORT_COLUMNS,
      programCode: 'Tonga_CD4',
      stripFromColumnNames: 'CD4 ',
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
