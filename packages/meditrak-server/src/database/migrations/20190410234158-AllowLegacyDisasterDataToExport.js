/**
 * Tupaia MediTrak
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { models } from '../migrate';

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

exports.up = async function(db) {
  const permissionGroups = await db.runSql(`
    SELECT id FROM "permission_group"
      WHERE "name" = 'Hidden';
  `);
  const permissionGroupId = permissionGroups.rows[0].id;
  return db.runSql(`
    UPDATE survey
    SET country_ids = '{}', permission_group_id = '${permissionGroupId}'
    WHERE code LIKE 'D%_LEGACY';
  `);
};

exports.down = async function(db) {
  const permissionGroups = await db.runSql(`
    SELECT id FROM "permission_group"
      WHERE "name" = 'Hidden';
  `);
  const permissionGroupId = permissionGroups.rows[0].id;

  const countries = await db.runSql(`
    SELECT id FROM "country"
      WHERE "name" = 'No Country';
  `);
  const countryId = countries.rows[0].id;
  return db.runSql(`
    UPDATE survey
    SET country_ids = '{${countryId}}', permission_group_id = '${permissionGroupId}'
    WHERE code LIKE 'D%_LEGACY';
  `);
};

exports._meta = {
  version: 1,
};
