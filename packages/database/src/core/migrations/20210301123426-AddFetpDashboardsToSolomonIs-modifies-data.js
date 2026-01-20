'use strict';

import { arrayToDbString, insertObject, updateValues } from '../utilities';

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

const revertDashboardGroupCodes = ['SB_FETP_Country_FETP_Graduates', 'SB_FETP_Country_Public'];

exports.up = async function (db) {
  const dashboardGroups = (
    await db.runSql(`
    select * from "dashboardGroup" where 'fetp' = ANY("projectCodes") and "organisationUnitCode" IN ('PG', 'SB');
  `)
  ).rows;

  const sbDashboardGroupCodes = dashboardGroups
    .filter(r => r.organisationUnitCode === 'SB')
    .map(dg => dg.code);

  const pgDashboardGroups = dashboardGroups.filter(r => r.organisationUnitCode === 'PG');

  const results = await Promise.all(
    pgDashboardGroups.map(dg => {
      const sbCodeToCheck = `SB${dg.code.substring(2)}`;
      if (sbDashboardGroupCodes.includes(sbCodeToCheck))
        return updateValues(
          db,
          'dashboardGroup',
          { dashboardReports: dg.dashboardReports },
          { code: sbCodeToCheck },
        );

      return insertObject(db, 'dashboardGroup', {
        organisationLevel: dg.organisationLevel,
        userGroup: dg.userGroup,
        organisationUnitCode: 'SB',
        dashboardReports: `{${dg.dashboardReports.join(',')}}`,
        name: dg.name,
        code: sbCodeToCheck,
        projectCodes: `{${dg.projectCodes.join(',')}}`,
      });
    }),
  );
};

exports.down = function (db) {
  return db.runSql(`
    update "dashboardGroup" set "dashboardReports" = '{}' where "code" in (${arrayToDbString(
      revertDashboardGroupCodes,
    )});
    delete from "dashboardGroup" 
    where 'fetp' = ANY("projectCodes") and "organisationUnitCode" = 'SB' 
    and "code" not in (${arrayToDbString(revertDashboardGroupCodes)});
  `);
};

exports._meta = {
  version: 1,
};
