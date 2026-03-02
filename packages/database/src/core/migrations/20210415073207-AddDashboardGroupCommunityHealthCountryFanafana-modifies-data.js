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
const dashboardGroups = [
  {
    organisationLevel: 'Country',
    organisationUnitCode: 'TO',
    name: 'Community Health Validation',
    code: 'TO_Community_Health_Validation_Country',
    projectCodes: `{fanafana}`,
  },
];

exports.up = async function (db) {
  await Promise.all(
    dashboardGroups.map(dashboardGroup =>
      insertObject(db, 'dashboardGroup', {
        organisationLevel: dashboardGroup.organisationLevel,
        userGroup: 'Tonga Community Health',
        organisationUnitCode: dashboardGroup.organisationUnitCode,
        dashboardReports: '{TO_CH_Validation_CH4,TO_CH_Validation_CH11}',
        name: dashboardGroup.name,
        code: dashboardGroup.code,
        projectCodes: dashboardGroup.projectCodes,
      }),
    ),
  );
};

exports.down = function (db) {
  return db.runSql(`
    delete from "dashboardGroup" where code in (${arrayToDbString(
      dashboardGroups.map(dbg => dbg.code),
    )});
  `);
};

exports._meta = {
  version: 1,
};
