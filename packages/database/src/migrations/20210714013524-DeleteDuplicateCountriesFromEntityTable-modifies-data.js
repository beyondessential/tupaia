'use strict';

import { arrayToDbString } from '../utilities';

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

const duplicateCountryEntityIds = [
  "'60da867061f76a20cf01e23f'", // duplicate Fiji
  "'60eb91df61f76a7f770790a3'", // duplicate Papua New Guinea
  "'60949c6061f76a622c020231'", // duplicate Samoa
];

const realCountryEntityIds = [
  "'5d51f501f013d6320f3cf633'", // real Fiji
  "'5d3f8844f327a531bfd8ad77'", // real Papua New Guinea
  "'5df1b88c61f76a485cd1ca09'", // real Samoa
];

const findMatchingCountries = (duplicateId, realId) => {
  // checks if both are Fiji entities
  if (duplicateId === "'60da867061f76a20cf01e23f'" && realId === "'5d51f501f013d6320f3cf633'") {
    return true;
  }
  // checks if both are Papua New Guinea entities
  if (duplicateId === "'60eb91df61f76a7f770790a3'" && realId === "'5d3f8844f327a531bfd8ad77'") {
    return true;
  }
  // checks if both are Samoa entities
  if (duplicateId === "'60949c6061f76a622c020231'" && realId === "'5df1b88c61f76a485cd1ca09'") {
    return true;
  }
  return false;
};

const findDeletes = (duplicateCountryUserPermissions, realCountryUserPermissions) =>
  duplicateCountryUserPermissions.filter(duplicateCountryUserPermission =>
    realCountryUserPermissions.find(realCountryUserPermission => {
      if (
        duplicateCountryUserPermission.user_id === realCountryUserPermission.user_id &&
        findMatchingCountries(
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

  // updates remaining Fiji permissions
  await db.runSql(`
  UPDATE user_entity_permission
    SET entity_id = '5d51f501f013d6320f3cf633'
      WHERE entity_id = '60da867061f76a20cf01e23f';
  `);

  // updates remaining Papua New Guinea permissions
  await db.runSql(`
  UPDATE user_entity_permission
    SET entity_id = '5d3f8844f327a531bfd8ad77'
      WHERE entity_id = '60eb91df61f76a7f770790a3';
  `);

  // updates remaining Samoa permissions
  await db.runSql(`
  UPDATE user_entity_permission
    SET entity_id = '5df1b88c61f76a485cd1ca09'
      WHERE entity_id = '60949c6061f76a622c020231';
  `);

  // updates access_requests for Fiji so the duplicate entity can be deleted
  await db.runSql(`
  UPDATE access_request
    SET entity_id = '5d51f501f013d6320f3cf633',
    note = concat(note, ' - this request was modified by DeleteDuplicateCountriesFromEntityTable')
      WHERE entity_id = '60da867061f76a20cf01e23f';
  `);

  // updates access_requests for Papua New Guinea so the duplicate entity can be deleted
  await db.runSql(`
  UPDATE access_request
    SET entity_id = '5d3f8844f327a531bfd8ad77',
    note = concat(note, ' - this request was modified by DeleteDuplicateCountriesFromEntityTable')
      WHERE entity_id = '60eb91df61f76a7f770790a3';
  `);

  // updates access_requests for Samoa so the duplicate entity can be deleted
  await db.runSql(`
  UPDATE access_request
    SET entity_id = '5df1b88c61f76a485cd1ca09',
    note = concat(note, ' - this request was modified by DeleteDuplicateCountriesFromEntityTable')
      WHERE entity_id = '60949c6061f76a622c020231';
  `);

  // finally delete the duplicate entities
  await db.runSql(`
  DELETE FROM entity
    WHERE id in (${duplicateCountryEntityIds});
  `);
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  "version": 1
};
