'use strict';

import { insertObject } from '../utilities';

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

// move this report from old dashboardGroup to newly created dashboardGroup
const reportId = 'WISH_Export_Surveys';

const oldDashboardGroupCode = 'WISH_Export_Surveys';
const newDashboardGroupCode = 'WISH_Restricted_Export_Surveys';

// Rename the old dashboardGroup
const oldDashboardGroupName = 'Fiji Data Downloads';
const newDashboardGroupName = 'WISH Fiji Data Downloads';

const newDashboardGroup = {
  organisationLevel: 'Country',
  userGroup: 'Fiji Restricted Data',
  organisationUnitCode: 'FJ',
  dashboardReports: `{ ${reportId} }`,
  name: 'WISH Fiji Restricted Downloads',
  code: newDashboardGroupCode,
  projectCodes: '{wish}',
};

exports.up = async function (db) {
  await insertObject(db, 'dashboardGroup', newDashboardGroup);
  return db.runSql(`
    UPDATE
      "dashboardGroup"
    SET
      "dashboardReports" = array_remove("dashboardReports", '${reportId}'),
      "name" = '${newDashboardGroupName}'
    WHERE
      "code" ='${oldDashboardGroupCode}';
  `);
};

exports.down = async function (db) {
  await db.runSql(`DELETE FROM "dashboardGroup" WHERE code = '${newDashboardGroup.code}';`);
  await db.runSql(`
    UPDATE
      "dashboardGroup"
    SET
      "dashboardReports" = "dashboardReports" || '{ ${reportId} }',
      "name" = '${oldDashboardGroupName}'
    WHERE
      "code" = '${oldDashboardGroupCode}';
  `);
};

exports._meta = {
  version: 1,
};
