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

const duplicateEntityIdByCountry = {
  FJ: "'60da867061f76a20cf01e23f'", // duplicate Fiji
  PG: "'60eb91df61f76a7f770790a3'", // duplicate Papua New Guinea
  WS: "'60949c6061f76a622c020231'", // duplicate Samoa
};

const realEntityIdByCountry = {
  FJ: "'5d51f501f013d6320f3cf633'", // real Fiji
  PG: "'5d3f8844f327a531bfd8ad77'", // real Papua New Guinea
  WS: "'5df1b88c61f76a485cd1ca09'", // real Samoa
};

const duplicateCountryEntityIds = Object.values(duplicateEntityIdByCountry);
const realCountryEntityIds = Object.values(realEntityIdByCountry);

const checkForCountryMatch = (duplicateId, realId) => {
  // checks if both are Fiji entities
  if (duplicateId === duplicateEntityIdByCountry.FJ && realId === realEntityIdByCountry.FJ) {
    return true;
  }
  // checks if both are Papua New Guinea entities
  if (duplicateId === duplicateEntityIdByCountry.PG && realId === realEntityIdByCountry.PG) {
    return true;
  }
  // checks if both are Samoa entities
  if (duplicateId === duplicateEntityIdByCountry.WS && realId === realEntityIdByCountry.WS) {
    return true;
  }
  return false;
};

const findDeletes = (duplicateCountryUserPermissions, realCountryUserPermissions) =>
  duplicateCountryUserPermissions.filter(duplicateCountryUserPermission =>
    realCountryUserPermissions.find(realCountryUserPermission => {
      if (
        duplicateCountryUserPermission.user_id === realCountryUserPermission.user_id &&
        checkForCountryMatch(
          `'${duplicateCountryUserPermission.entity_id}'`,
          `'${realCountryUserPermission.entity_id}'`,
        ) &&
        duplicateCountryUserPermission.permission_group_id ===
          realCountryUserPermission.permission_group_id
      ) {
        return true;
      }
      return false;
    }),
  );

exports.up = async function (db) {
  const { rows: duplicateCountryUserPermissions } = await db.runSql(`
    select * from user_entity_permission where entity_id in (${duplicateCountryEntityIds});
  `);

  const { rows: realCountryUserPermissions } = await db.runSql(`
    select * from user_entity_permission where entity_id in (${realCountryEntityIds});
  `);

  const permissionsToDelete = await findDeletes(
    duplicateCountryUserPermissions,
    realCountryUserPermissions,
  );

  const permissionIdsToDelete = await permissionsToDelete.map(permission => {
    return permission.id;
  });

  // deletes duplicate permissions for the duplicate countries
  await db.runSql(`
  DELETE FROM user_entity_permission
    WHERE id IN (${arrayToDbString(permissionIdsToDelete)});
  `);

  // updates remaining entity permissions and access requests so duplicate entity can be deleted
  for (const countryCode of Object.keys(realEntityIdByCountry)) {
    await db.runSql(`
      UPDATE user_entity_permission
        SET entity_id = ${realEntityIdByCountry[countryCode]}
          WHERE entity_id = ${duplicateEntityIdByCountry[countryCode]};

      UPDATE access_request
        SET entity_id = ${realEntityIdByCountry[countryCode]},
        note = concat(note, ' - this request was modified by DeleteDuplicateCountriesFromEntityTable')
          WHERE entity_id = ${duplicateEntityIdByCountry[countryCode]};
      `);
  }

  // finally delete the duplicate entities
  await db.runSql(`
  DELETE FROM entity
    WHERE id in (${duplicateCountryEntityIds});
  `);
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
