'use strict';

import { insertObject } from '../utilities/migration';
import { generateId } from '../utilities/generateId';

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

exports.up = function(db) {
  return db.runSql(`
    DELETE FROM map_overlay_group_relation where child_id IN (SELECT id FROM map_overlay_group where name = 'Services provided');
  `)
};

exports.down = async function(db) {
  const mapOverlayGroupRelation = {
    id: generateId(),
    map_overlay_group_id: '5f88d3a361f76a2d3f000004',
    child_id: '5f2c7ddb61f76a513a000037',
    child_type: 'mapOverlayGroup',
  };

  await insertObject(db, 'map_overlay_group_relation', mapOverlayGroupRelation);
};


exports._meta = {
  "version": 1
};
