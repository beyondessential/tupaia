'use strict';

import { generateId, insertObject, codeToId } from '../utilities';

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

const PARENT_OVERLAY_GROUP_CODE = 'Root';
const OVERLAY_GROUP = {
  id: generateId(),
  name: 'FluTracking (Postcode level)',
  code: 'flutracking_au_postcode_level',
};

exports.up = async function (db) {
  const rootId = await codeToId(db, 'map_overlay_group', PARENT_OVERLAY_GROUP_CODE);
  await insertObject(db, 'map_overlay_group', OVERLAY_GROUP);
  await insertObject(db, 'map_overlay_group_relation', {
    id: generateId(),
    map_overlay_group_id: rootId,
    child_id: OVERLAY_GROUP.id,
    child_type: 'mapOverlayGroup',
    sort_order: 2,
  });
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
