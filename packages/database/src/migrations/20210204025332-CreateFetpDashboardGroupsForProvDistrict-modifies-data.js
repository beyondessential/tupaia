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

// 'PG_FETP_District_Public',
// 'PG_FETP_District_FETP_Graduates',
// 'PG_FETP_SubDistrict_Public',
// 'PG_FETP_SubDistrict_FETP_Graduates',

const countryCode = 'PG';
const name = 'FETP';
const levels = ['District', 'SubDistrict'];
const users = ['Public', 'FETP_Graduates'];

const dashboardGroup = (level, userGroup) => ({
  organisationLevel: level,
  userGroup,
  organisationUnitCode: countryCode,
  dashboardReports: `{}`,
  name,
  code: `${countryCode}_${name}_${level}_${userGroup.split(' ').join('_')}`,
  projectCodes: `{fetp}`,
});

const dashboardGroupConfigs = [];

levels.forEach(level => {
  users.forEach(user => {
    dashboardGroupConfigs.push(dashboardGroup(level, user));
  });
});

exports.up = async function (db) {
  // clean up existing groups
  await db.runSql(`
    update "dashboardGroup"
    set "dashboardReports" = array_remove("dashboardReports", 'project_details')
    where "code" IN ('PG_FETP_Country_Public', 'PG_FETP_Country_FETP_Graduates', 'SB_FETP_Country_FETP_Graduates');
  `);
  return Promise.all(dashboardGroupConfigs.map(dbg => insertObject(db, 'dashboardGroup', dbg)));
};

exports.down = function (db) {
  return db.runSql(`
    delete from "dashboardGroup" where "code" IN (${arrayToDbString(
      dashboardGroupConfigs.map(dbg => dbg.code),
    )});
  `);
};

exports._meta = {
  version: 1,
};
