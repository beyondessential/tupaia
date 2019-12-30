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
const REPORT_ID = 'SCRF_Case_By_Classifications';
const REPORT_NAME = 'Number of cases by classification';

exports.up = async function(db) {
  await insertObject(db, 'dashboardReport', {
    id: REPORT_ID,
    dataBuilder: 'countByAllDataValues',
    dataBuilderConfig: {
      programCode: PROGRAM_CODE,
      dataElementCodes: ['STR_CRF175'],
    },

    viewJson: {
      name: REPORT_NAME,
      type: 'chart',
      chartType: 'pie',
    },
  });

  return db.runSql(`
  UPDATE 
    "dashboardReport"
  SET
    "dataBuilder" = 'countByLatestDataValues'
  WHERE
    "dataBuilder" = 'countByDataValue';
  

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
    "dashboardReport"
  SET
    "dataBuilder" = 'countByDataValue'
  WHERE
    "dataBuilder" = 'countByLatestDataValues';


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
