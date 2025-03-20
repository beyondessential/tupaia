'use strict';

import { insertObject, generateId, codeToId } from '../utilities';

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

const MAP_OVERLAY_GROUP_CODE = 'Mosquito_occurrence_by_species';

exports.up = async function (db) {
  const mapOverlayGroupId = generateId();

  // Map overlay group
  await insertObject(db, 'map_overlay_group', {
    id: mapOverlayGroupId,
    name: 'Mosquito occurrence by species',
    code: MAP_OVERLAY_GROUP_CODE,
  });
  const rootMapOverlayGroupId = await codeToId(db, 'map_overlay_group', 'Root');
  await insertObject(db, 'map_overlay_group_relation', {
    id: generateId(),
    map_overlay_group_id: rootMapOverlayGroupId,
    child_id: mapOverlayGroupId,
    child_type: 'mapOverlayGroup',
    sort_order: 1,
  });
};

exports.down = async function (db) {
  return db.runSql(`
    DELETE FROM "map_overlay_group" WHERE "code" = '${MAP_OVERLAY_GROUP_CODE}';
  `);
};

exports._meta = {
  version: 1,
};
