'use strict';

import { insertObject, generateId } from '../utilities';

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

const selectAllMapOverlays = async db => db.runSql('SELECT * FROM "mapOverlay";');

exports.up = async function(db) {
  const mapOverlays = await selectAllMapOverlays(db);

  const mapOverlayGroupNameToId = {};

  for (let i = 0; i < mapOverlays.rows.length; i++) {
    const { groupName, id: mapOverlayId } = mapOverlays.rows[i];
    let mapOverlayGroupId = mapOverlayGroupNameToId[groupName];

    if (!mapOverlayGroupNameToId[groupName]) {
      mapOverlayGroupId = generateId();

      const mapOverlayGroup = {
        id: mapOverlayGroupId,
        name: groupName,
        code: groupName.split(' ').join('_'),
        top_level: true,
      };

      await insertObject(db, 'map_overlay_group', mapOverlayGroup);
      mapOverlayGroupNameToId[groupName] = mapOverlayGroupId;
    }

    const mapOverlayGroupLink = {
      id: generateId(),
      map_overlay_group_id: mapOverlayGroupId,
      child_id: mapOverlayId,
      child_type: 'mapOverlay',
    };

    await insertObject(db, 'map_overlay_group_link', mapOverlayGroupLink);
  }
};

exports.down = function(db) {
  return db.runSql(`
    TRUNCATE TABLE map_overlay_group;
    TRUNCATE TABLE map_overlay_group_link;
  `);
};

exports._meta = {
  version: 1,
};
