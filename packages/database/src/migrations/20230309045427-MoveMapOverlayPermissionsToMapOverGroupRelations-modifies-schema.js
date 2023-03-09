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

exports.up = async function (db) {
  // Step 1: Add permission_groups column to map_overlay_group_relation
  await db.runSql(`
    ALTER TABLE map_overlay_group_relation ADD COLUMN permission_groups TEXT[] DEFAULT '{}';
  `);

  // Step 2: For each map overlay, add its permission groups to the permission groups of its relations
  const mapOverlays = (await db.runSql('SELECT * FROM map_overlay')).rows;
  for (let i = 0; i < mapOverlays.length; i++) {
    const mapOverlay = mapOverlays[i];
    await db.runSql(
      `
      UPDATE map_overlay_group_relation
      SET permission_groups = array_append(permission_groups, ?)
      WHERE child_type = 'mapOverlay' AND child_id = ?
    `,
      [mapOverlay.permission_group, mapOverlay.id],
    );
  }

  // Step 3: Remove permission_group column from map_overlay
  await db.runSql(`
    ALTER TABLE map_overlay DROP COLUMN permission_group;
  `);
};

exports.down = async function (db) {
  // Step 1: Add permission_group column to map_overlay
  await db.runSql(`
    ALTER TABLE map_overlay ADD COLUMN permission_group TEXT NOT NULL;
  `);

  // Step 2: For each relation, set its first permission groups to the permission group of its map overlay
  const mapOverlayGroupRelations = (
    await db.runSql(`
      SELECT * FROM map_overlay_group_relation 
      WHERE child_type = 'mapOverlay' 
    `)
  ).rows;
  for (let i = 0; i < mapOverlayGroupRelations.length; i++) {
    const relation = mapOverlayGroupRelations[i];
    await db.runSql(
      `
      UPDATE map_overlay
      SET permission_group = ?
      WHERE id = ?
    `,
      [relation.permission_groups[0], relation.child_id],
    );
  }

  // Step 3: Remove permission_groups column from map_overlay_group_relation
  await db.runSql(`
    ALTER TABLE map_overlay_group_relation DROP COLUMN permission_groups;
  `);
};

exports._meta = {
  version: 1,
};
