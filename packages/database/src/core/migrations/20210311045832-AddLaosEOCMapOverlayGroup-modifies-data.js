'use strict';

import { generateId, insertObject } from '../utilities';

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

const measlesMapOverlayGroup = {
  id: generateId(),
  name: 'Measles',
  code: 'LAOS_EOC_Measles',
};

const mapOverlayGroupToRootRelation = {
  id: generateId(),
  map_overlay_group_id: '5f88d3a361f76a2d3f000004',
  child_type: 'mapOverlayGroup',
};

exports.up = async function (db) {
  await insertObject(db, 'map_overlay_group', measlesMapOverlayGroup);

  mapOverlayGroupToRootRelation.child_id = measlesMapOverlayGroup.id;

  await insertObject(db, 'map_overlay_group_relation', mapOverlayGroupToRootRelation);

  return null;
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
