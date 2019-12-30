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
  id: 'PG_Strive_PNG_Case_Report_Form_Export',
  name: 'Case Report Form Export',
  columns: {
    STR_CRF167: { title: 'UID' },
    STR_CRF197: { title: 'Site' },
    STR_CRF04: { title: 'Date of sample collection' },
  },
  isDataRegional: true,
  periodGranularity: 'day',
};
const DASHBOARD_GROUP_CODES = ['PG_Strive_PNG'];
const PROGRAM_CODE = 'SCRF';

const arrayToDbString = array => array.map(item => `'${item}'`).join(', ');

exports.up = async function(db) {
  await insertObject(db, 'dashboardReport', {
    id: REPORT.id,
    dataBuilder: 'tableOfEvents',
    dataBuilderConfig: {
      columns: REPORT.columns,
      programCode: PROGRAM_CODE,
    },
    viewJson: {
      name: REPORT.name,
      type: 'chart',
      chartType: 'matrix',
      placeholder: '/static/media/PEHSMatrixPlaceholder.png',
      periodGranularity: REPORT.periodGranularity,
      exportConfig: {
        dataElementHeader: 'Reporting period',
      },
    },
    dataServices: [{ isDataRegional: REPORT.isDataRegional }],
  });

  return db.runSql(`
    UPDATE
      "dashboardGroup"
    SET
      "dashboardReports" = "dashboardReports" || '{ ${REPORT.id} }'
    WHERE
      "code" IN (${arrayToDbString(DASHBOARD_GROUP_CODES)});
  `);
};

exports.down = function(db) {
  return db.runSql(`
    DELETE FROM "dashboardReport" WHERE id = '${REPORT.id}';

    UPDATE
      "dashboardGroup"
    SET
      "dashboardReports" = array_remove("dashboardReports", '${REPORT.id}')
    WHERE
      "code" IN (${arrayToDbString(DASHBOARD_GROUP_CODES)});
  `);
};

exports._meta = {
  version: 1,
};
