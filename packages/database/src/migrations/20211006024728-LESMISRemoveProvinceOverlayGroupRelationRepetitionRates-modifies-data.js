'use strict';

import { insertObject, generateId } from '../utilities';

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

const MAP_OVERLAY_IDS = [
  'LESMIS_grade_1_repetition_rate__district_map',
  'LESMIS_grade_2_repetition_rate__district_map',
  'LESMIS_grade_3_repetition_rate__district_map',
  'LESMIS_grade_4_repetition_rate__district_map',
  'LESMIS_grade_5_repetition_rate__district_map',
  'LESMIS_grade_6_repetition_rate__district_map',
  'LESMIS_grade_7_repetition_rate__district_map',
  'LESMIS_grade_8_repetition_rate__district_map',
  'LESMIS_grade_9_repetition_rate__district_map',
  'LESMIS_grade_10_repetition_rate__district_map',
  'LESMIS_grade_11_repetition_rate__district_map',
  'LESMIS_grade_12_repetition_rate__district_map',
  'LESMIS_primary_repetition_rate_district_map',
  'LESMIS_lowersecondary_repetition_rate_district_map',
  'LESMIS_uppersecondary_repetition_rate_district_map',
  'LESMIS_grade_6_repetition_rate_GPI_district_map',
];

exports.up = async function (db) {
  // insert overlay relation records for overlays to district group
  MAP_OVERLAY_IDS.forEach(async id => {
    await insertObject(db, 'map_overlay_group_relation', {
      id: generateId(),
      map_overlay_group_id: '5f2c7ddc61f76a513a000215',
      child_id: id,
      child_type: 'mapOverlay',
    });
  });

  // Delete repetition rate province overlay group relation from parent.
  await db.runSql(`
    DELETE FROM "map_overlay_group_relation" WHERE "child_id" = '5f2c7ddc61f76a513a000216';
    `);
};

exports.down = async function (db) {
  // add group relation for repetition rate province overlay to parent.
  await insertObject(db, 'map_overlay_group_relation', {
    id: generateId(),
    map_overlay_group_id: '5f2c7ddc61f76a513a000214',
    child_id: '5f2c7ddc61f76a513a000216',
    child_type: 'mapOverlayGroup',
  });

  // remove overlay relations
  MAP_OVERLAY_IDS.forEach(async id => {
    await db.runSql(`
      DELETE FROM "map_overlay_group_relation" WHERE "child_id" = '${id}';
      `);
  });
};

exports._meta = {
  version: 1,
};
