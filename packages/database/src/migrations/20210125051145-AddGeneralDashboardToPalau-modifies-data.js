'use strict';

import { arrayToDbString } from '../utilities';

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

const DASHBOARD_GROUPS_TO_COPY = [
  '221',
  '222',
  '223',
  '224',
  '225',
  '226',
  '227',
  '228',
  '229',
  '232',
];
const COUNTRY_DONOR_EXTRA_DASHBOARDS = ['23', '19', '8', '26'];

const addDashboardGroupsToCountry = (db, dashboardGroups, countryCode) =>
  Promise.all(
    dashboardGroups.map(dashboardGroup => {
      const { organisationLevel, userGroup, dashboardReports, name } = dashboardGroup;
      if (organisationLevel === 'Country' && userGroup === 'Donor') {
        return null; // TODO: Add COUNTRY_DONOR_EXTRA_DASHBOARDS to dashboardReports
      }

      return db.runSql(`
        INSERT INTO "dashboardGroup" (
          "organisationLevel",
          "userGroup",
          "organisationUnitCode",
          "dashboardReports",
          "name",
          "code",
          "projectCodes"
        )
        VALUES (
          '${organisationLevel}',
          '${userGroup}',
          '${countryCode}',
          '{${dashboardReports}}',     
          '${name}',
          '${[countryCode, name, organisationLevel, userGroup].join('_')}',
          '{explore}'
        )`);
    }),
  );

const hasWorldDashboard = `"organisationLevel" <> 'World' AND "organisationUnitCode" = 'World'`;

exports.up = async function (db) {
  const { rows: dashboardGroups } = await db.runSql(
    `SELECT * from "dashboardGroup" WHERE id in (${arrayToDbString(DASHBOARD_GROUPS_TO_COPY)})`,
  );

  await addDashboardGroupsToCountry(db, dashboardGroups, 'PW');
};

exports.down = async function (db) {
  await db.runSql(
    `DELETE FROM "dashboardGroup" WHERE name='General' AND "organisationUnitCode"='PW';`,
  );
};

exports._meta = {
  version: 1,
};
