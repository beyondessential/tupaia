'use strict';

import { insertObject, arrayToDbString } from '../migrationUtilities';

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

const DASHBOARD_GROUP_CODES = ['PG_Strive_PNG_Country', 'PG_Strive_PNG_Facility'];
const PROGRAM_CODE = 'SCRF';
const REPORT_ID = 'SCRF_RDT_Positive_Results';
const REPORT_NAME = 'Number of positive RDTs by result';

exports.up = async function(db) {
  await insertObject(db, 'dashboardReport', {
    id: REPORT_ID,
    dataBuilder: 'countByAllDataValues',
    dataBuilderConfig: {
      programCode: PROGRAM_CODE,
      dataElementCodes: ['STR_CRF169'],
      valuesOfInterest: ['Positive Pf', 'Positive Pf or mixed', 'Positive Non-Pf'],
    },

    viewJson: {
      name: REPORT_NAME,
      type: 'chart',
      chartType: 'pie',
    },
  });

  return db.runSql(`
    UPDATE
      "dashboardGroup"
    SET
      "dashboardReports" = "dashboardReports" || '{ ${REPORT_ID} }'
    WHERE
      "code" IN (${arrayToDbString(DASHBOARD_GROUP_CODES)});
  `);
};

exports.down = function(db) {
  return db.runSql(`
    DELETE FROM "dashboardReport" WHERE id = '${REPORT_ID}';

    UPDATE
      "dashboardGroup"
    SET
      "dashboardReports" = array_remove("dashboardReports", '${REPORT_ID}')
    WHERE
      "code" IN (${arrayToDbString(DASHBOARD_GROUP_CODES)});
  `);
};

exports._meta = {
  version: 1,
};
