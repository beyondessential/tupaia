'use strict';

import { insertObject } from '../utilities';

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

const REPORT_ID = 'WISH_Export_Surveys';

const OLD_DASHBOARD_GROUP_CODE = 'WISH_Export_Surveys';

const NEW_DASHBOARD_GROUP = {
  organisationLevel: 'Country',
  userGroup: 'Fiji Restricted Data',
  organisationUnitCode: 'FJ',
  dashboardReports: `{ ${REPORT_ID} }`,
  name: 'WISH Fiji Restricted Downloads',
  code: 'WISH_Restricted_Export_Surveys',
  projectCodes: '{wish}',
};

exports.up = async function(db) {
  await insertObject(db, 'dashboardGroup', NEW_DASHBOARD_GROUP);
  return db.runSql(`
    UPDATE
      "dashboardGroup"
    SET
      "dashboardReports" = array_remove("dashboardReports", '${REPORT_ID}')
    WHERE
      "code" ='${OLD_DASHBOARD_GROUP_CODE}';
  `);
};

exports.down = async function(db) {
  await db.runSql(`DELETE FROM "dashboardGroup" WHERE code = '${NEW_DASHBOARD_GROUP.code}';`);
  await db.runSql(`
    UPDATE
      "dashboardGroup"
    SET
      "dashboardReports" = "dashboardReports" || '{ ${REPORT_ID} }'
    WHERE
      "code" = '${OLD_DASHBOARD_GROUP_CODE}';
  `);
};

exports._meta = {
  version: 1,
};
