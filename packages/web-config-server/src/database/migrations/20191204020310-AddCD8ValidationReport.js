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

const REPORT = {
  id: 'TO_CD_Validation_CD8',
  name: 'Suspect Cases of Notifiable Diseases',
  columns: {
    CD92: { sortOrder: 1 },
    CD93: { sortOrder: 2 },
    CD94: { sortOrder: 3 },
    CD96: { sortOrder: 4 },
    CD95: { sortOrder: 5 },
  },
};

exports.up = async function(db) {
  await insertObject(db, 'dashboardReport', {
    id: REPORT.id,
    dataBuilder: 'tableOfEvents',
    dataBuilderConfig: {
      columns: REPORT.columns,
      programCode: 'CD8',
      stripFromColumnNames: 'CD8 ',
    },
    viewJson: {
      name: REPORT.name,
      type: 'matrix',
      placeholder: '/static/media/PEHSMatrixPlaceholder.png',
      periodGranularity: 'one_month_at_a_time',
    },
    dataServices: [{ isDataRegional: false }],
  });

  return db.runSql(`
    UPDATE
      "dashboardGroup"
    SET
      "dashboardReports" = "dashboardReports" ||'{ ${REPORT.id} }'
    WHERE
      "code" IN (
        'TO_Communicable_Diseases_Validation',
        'DL_Communicable_Diseases_Validation'
      );
  `);
};

exports.down = function(db) {
  return db.runSql(`
    DELETE FROM "dashboardReport" WHERE "id" = '${REPORT.id}';

    UPDATE
      "dashboardGroup"
    SET
      "dashboardReports" = array_remove("dashboardReports", '${REPORT.id}')
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
