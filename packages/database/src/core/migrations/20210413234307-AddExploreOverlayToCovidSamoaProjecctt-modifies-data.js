'use strict';

import { codeToId, insertObject, generateId } from '../utilities';

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

const overlayIDs = ['Samoa_COVID_Isolation_Beds', 'Samoa_COVID_ICU_Beds'];

const mapOverLayGroupId = async db => {
  return codeToId(db, 'map_overlay_group', 'COVID19_Samoa');
};

exports.up = async function (db) {
  for (const id of overlayIDs) {
    await insertObject(db, 'map_overlay_group_relation', {
      id: generateId(),
      map_overlay_group_id: await mapOverLayGroupId(db),
      child_id: id,
      child_type: 'mapOverlay',
    });
  }
};

exports.down = async function (db) {
  for (const id of overlayIDs) {
    await db.runSql(`
      delete from "map_overlay_group_relation" 
      where "child_id" = '${id}'
      and "map_overlay_group_id" = '${await mapOverLayGroupId(db)}';
    `);
  }
};

exports._meta = {
  version: 1,
};
