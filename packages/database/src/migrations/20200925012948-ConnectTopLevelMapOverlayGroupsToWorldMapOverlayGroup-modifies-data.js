'use strict';

import { insertObject, generateId, codeToId } from '../utilities';

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

const WORLD_MAP_OVERLAY_GROUP_CODE = 'World_Group';

const findTopLevelMapOverlayGroups = db =>
  db.runSql(`
    SELECT map_overlay_group.* FROM map_overlay_group
    LEFT OUTER JOIN map_overlay_group_relation
    ON map_overlay_group.id = map_overlay_group_relation.child_id
    WHERE map_overlay_group_relation.child_id IS NULL
    AND map_overlay_group.code != '${WORLD_MAP_OVERLAY_GROUP_CODE}';
`);

exports.up = async function(db) {
  const topLevelOverlayGroups = (await findTopLevelMapOverlayGroups(db)).rows;
  const worldOverlayGroupId = await codeToId(db, 'map_overlay_group', WORLD_MAP_OVERLAY_GROUP_CODE);

  for (let i = 0; i < topLevelOverlayGroups.length; i++) {
    const overlayGroup = topLevelOverlayGroups[i];
    const relation = {
      id: generateId(),
      map_overlay_group_id: worldOverlayGroupId,
      child_id: overlayGroup.id,
      child_type: 'mapOverlayGroup',
    };
    await insertObject(db, 'map_overlay_group_relation', relation);
  }
};

exports.down = async function(db) {
  const worldOverlayGroupId = await codeToId(db, 'map_overlay_group', WORLD_MAP_OVERLAY_GROUP_CODE);

  await db.runSql(`
    DELETE FROM map_overlay_group_relation
    WHERE map_overlay_group_id = '${worldOverlayGroupId}';
  `);
};

exports._meta = {
  version: 1,
};
