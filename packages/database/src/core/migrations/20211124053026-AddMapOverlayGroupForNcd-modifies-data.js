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

const overlayGroupRecord = {
  name: 'School Nutrition Standard Compliance',
  code: 'ncd_ws_school_nutrition_standard_compliance',
};

const addMapOverlayGroup = async (db, { name, code }) => {
  const rootParentId = await codeToId(db, 'map_overlay_group', 'Root');
  const overlayGroupId = generateId();
  await insertObject(db, 'map_overlay_group', { id: overlayGroupId, name, code });
  return insertObject(db, 'map_overlay_group_relation', {
    id: generateId(),
    map_overlay_group_id: rootParentId,
    child_id: overlayGroupId,
    child_type: 'mapOverlayGroup',
  });
};

exports.up = async function (db) {
  return addMapOverlayGroup(db, overlayGroupRecord);
};

const removeMapOverlayGroupRelation = async (db, groupCode) => {
  const overlayId = await codeToId(db, 'map_overlay_group', groupCode);
  return db.runSql(`
    DELETE FROM "map_overlay_group_relation" WHERE "child_id" = '${overlayId}';
  `);
};

exports.down = async function (db) {
  // Remove Map Overlay Group Relation
  await removeMapOverlayGroupRelation(db, overlayGroupRecord.code);

  // Remove Map Overlay Group
  return db.runSql(`
    DELETE FROM "map_overlay_group" WHERE "code" = '${overlayGroupRecord.code}';
  `);
};

exports._meta = {
  version: 1,
};
