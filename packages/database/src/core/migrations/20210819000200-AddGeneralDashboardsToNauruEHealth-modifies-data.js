'use strict';

import { codeToId, generateId, insertObject } from '../utilities';

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

const permissionGroupNameToId = async (db, name) => {
  const record = await db.runSql(`SELECT id FROM permission_group WHERE name = '${name}'`);
  return record.rows[0] && record.rows[0].id;
};

exports.up = async function (db) {
  const nauruEHealthAdminPermissionGroupId = await permissionGroupNameToId(
    db,
    'Nauru eHealth Admin',
  );
  const donorPermissionGroupId = await permissionGroupNameToId(db, 'Donor');
  const nauruCovidDashboardId = await codeToId(db, 'dashboard', 'NR_COVID-19_Nauru');
  const nauruEntityId = await codeToId(db, 'entity', 'NR');

  // Create new permission group, Nauru eHealth, under Nauru eHealth Admin
  const nauruEHealthPermissionGroupId = generateId();
  await insertObject(db, 'permission_group', {
    id: nauruEHealthPermissionGroupId,
    name: 'Nauru eHealth',
    parent_id: nauruEHealthAdminPermissionGroupId, // Admin
  });

  // Create 2 new dashboards, General and Clinical, under Nauru
  await insertObject(db, 'dashboard', {
    id: generateId(),
    code: 'NR_General',
    name: 'General',
    root_entity_code: 'NR',
  });
  await insertObject(db, 'dashboard', {
    id: generateId(),
    code: 'NR_Clinical',
    name: 'Clinical',
    root_entity_code: 'NR',
  });

  // Switch existing users with Donor permission to Nauru over to Nauru eHealth permission
  await db.runSql(`
    UPDATE user_entity_permission
    SET permission_group_id = '${nauruEHealthPermissionGroupId}'
    WHERE permission_group_id = '${donorPermissionGroupId}' AND entity_id = '${nauruEntityId}';
  `);

  // Move existing Nauru Covid dashboard items over to Nauru eHealth permissions
  await db.runSql(`
    UPDATE dashboard_relation
    SET permission_groups = '{Nauru eHealth}'
    WHERE dashboard_id = '${nauruCovidDashboardId}';
  `);

  // Update project to have Nauru eHealth permission group
  await db.runSql(`
    UPDATE project
    SET user_groups = '{Nauru eHealth}'
    WHERE code = 'ehealth_nauru';
  `);

  // Delete un-unsed Nauru NCD permission group
  await db.runSql(`
    DELETE FROM permission_group
    WHERE name = 'Nauru NCD';
  `);
  return null;
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
