'use strict';

import { arrayToDbString, insertObject, generateId } from '../utilities';

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */

const mapOverlayGroup = {
  id: generateId(),
  name: 'Measles',
  code: 'LAOS_EOC_Measles',
};

// Root
const mapOverlayGroupToRootRelation = {
  id: generateId(),
  map_overlay_group_id: '5f88d3a361f76a2d3f000004',
  child_id: mapOverlayGroup.code,
  child_type: 'mapOverlayGroup',
};

exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = async function (db) {
  await insertObject(db, 'map_overlay_group', mapOverlayGroup);
  await insertObject(db, 'map_overlay_group_relation', mapOverlayGroupToRootRelation);
  return null;
};

exports.down = function (db) {
  return db.runSql(`
    delete from map_overlay_group_relation where id = '${mapOverlayGroupToRootRelation.id}';
    delete from map_overlay_group where code = '${mapOverlayGroup.code}';
  `);
};

exports._meta = {
  version: 1,
};
