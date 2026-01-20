'use strict';

import { insertObject, arrayToDbString } from '../utilities';

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

const REPORT = {
  id: 'TO_HPU_New_Quitline_Calls',
  dataBuilder: 'sum',
  dataBuilderConfig: {
    dataElementCodes: ['HP216'],
    aggregationType: 'SUM',
  },
  viewJson: {
    name: 'Number of new quitline calls (by Year)',
    type: 'view',
    periodGranularity: 'one_year_at_a_time',
    viewType: 'singleValue',
    valueType: 'number',
  },
  dataServices: [{ isDataRegional: false }],
};

const DASHBOARD_GROUP_CODES = ['TO_Health_Promotion_Unit_Country'];

exports.up = async function (db) {
  await insertObject(db, 'dashboardReport', REPORT);

  await db.runSql(`
    UPDATE
      "dashboardGroup"
    SET
      "dashboardReports" = "dashboardReports" || '{ ${REPORT.id} }'
    WHERE
      "code" IN (${arrayToDbString(DASHBOARD_GROUP_CODES)});
  `);
};

exports.down = function (db) {
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
