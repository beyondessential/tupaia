'use strict';

import { arrayToDbString, insertObject } from '../utilities';

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

const replaceOrganisationLevel = async (db, oldLevel, newLevel) =>
  db.runSql(`
    UPDATE
      "dashboardGroup"
    SET
      code = REPLACE(code, '${oldLevel}', '${newLevel}'),
      "organisationLevel" = '${newLevel}'
    WHERE
      "organisationLevel" = '${oldLevel}';
`);

const getCountriesWithSubDistricts = async db => {
  const { rows } = await db.runSql(`
    SELECT distinct(child.country_code) from entity child
    JOIN entity parent on parent.id = child.parent_id
    WHERE child.type = 'region' and parent.type = 'region'
  `);
  return rows.map(({ country_code: countryCode }) => countryCode);
};

const getDistrictGroupsForCountries = async (db, countries) => {
  const { rows: districtGroups } = await db.runSql(`
    SELECT * FROM "dashboardGroup"
    WHERE "organisationLevel" = 'District' AND "organisationUnitCode" IN (${arrayToDbString(
      countries,
    )});
`);
  return districtGroups;
};

const addSubDistrictGroupsMatchingDistrict = async (db, dashboardGroups) =>
  Promise.all(
    dashboardGroups.map(({ id, code, dashboardReports, ...otherProps }) =>
      insertObject(db, 'dashboardGroup', {
        ...otherProps,
        dashboardReports: `{${dashboardReports}}`,
        code: code.replace('District', 'SubDistrict'),
        organisationLevel: 'SubDistrict',
      }),
    ),
  );

exports.up = async function (db) {
  await replaceOrganisationLevel(db, 'Province', 'District');
  const countriesWithSubDistricts = await getCountriesWithSubDistricts(db);
  const dashboardGroups = await getDistrictGroupsForCountries(db, countriesWithSubDistricts);
  await addSubDistrictGroupsMatchingDistrict(db, dashboardGroups);

  // We don't want reports in the SubDistrict level for Australia
  await db.runSql(`
    DELETE FROM "dashboardGroup"
    WHERE "organisationLevel" = 'SubDistrict' AND "organisationUnitCode" = 'AU';
  `);
};

exports.down = async function (db) {
  await db.runSql(`DELETE FROM "dashboardGroup" WHERE "organisationLevel" = 'SubDistrict';`);
  await replaceOrganisationLevel(db, 'District', 'Province');
};

exports._meta = {
  version: 1,
};
