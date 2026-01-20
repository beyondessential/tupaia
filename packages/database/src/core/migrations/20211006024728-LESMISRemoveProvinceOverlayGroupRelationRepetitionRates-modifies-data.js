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
// overlays for adding relations
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
// reports to remove empty string dataElement
const REPORTS = [
  {
    code: 'LESMIS_grade_1_repetition_rate__district_map',
    dataElements: 'rr_district_p1_t',
  },
  {
    code: 'LESMIS_grade_2_repetition_rate__district_map',
    dataElements: 'rr_district_p2_t',
  },
  {
    code: 'LESMIS_grade_3_repetition_rate__district_map',
    dataElements: 'rr_district_p3_t',
  },
  {
    code: 'LESMIS_grade_4_repetition_rate__district_map',
    dataElements: 'rr_district_p4_t',
  },
  {
    code: 'LESMIS_grade_5_repetition_rate__district_map',
    dataElements: 'rr_district_p5_t',
  },
  {
    code: 'LESMIS_grade_6_repetition_rate__district_map',
    dataElements: 'rr_district_s1_t',
  },
  {
    code: 'LESMIS_grade_7_repetition_rate__district_map',
    dataElements: 'rr_district_s2_t',
  },
  {
    code: 'LESMIS_grade_8_repetition_rate__district_map',
    dataElements: 'rr_district_s3_t',
  },
  {
    code: 'LESMIS_grade_9_repetition_rate__district_map',
    dataElements: 'rr_district_s4_t',
  },
  {
    code: 'LESMIS_grade_10_repetition_rate__district_map',
    dataElements: 'rr_district_s5_t',
  },
  {
    code: 'LESMIS_grade_11_repetition_rate__district_map',
    dataElements: 'rr_district_s6_t',
  },
  {
    code: 'LESMIS_grade_12_repetition_rate__district_map',
    dataElements: 'rr_district_s7_t',
  },
  {
    code: 'LESMIS_grade_1_dropout_rate__district_map',
    dataElements: 'dor_district_p1_t',
  },
  {
    code: 'LESMIS_grade_2_dropout_rate__district_map',
    dataElements: 'dor_district_p2_t',
  },
  {
    code: 'LESMIS_grade_3_dropout_rate__district_map',
    dataElements: 'dor_district_p3_t',
  },
  {
    code: 'LESMIS_grade_4_dropout_rate__district_map',
    dataElements: 'dor_district_p4_t',
  },
  {
    code: 'LESMIS_grade_5_dropout_rate__district_map',
    dataElements: 'dor_district_p5_t',
  },
  {
    code: 'LESMIS_grade_6_dropout_rate__district_map',
    dataElements: 'dor_district_s1_t',
  },
  {
    code: 'LESMIS_grade_7_dropout_rate__district_map',
    dataElements: 'dor_district_s2_t',
  },
  {
    code: 'LESMIS_grade_8_dropout_rate__district_map',
    dataElements: 'dor_district_s3_t',
  },
  {
    code: 'LESMIS_grade_9_dropout_rate__district_map',
    dataElements: 'dor_district_s4_t',
  },
  {
    code: 'LESMIS_grade_10_dropout_rate__district_map',
    dataElements: 'dor_district_s5_t',
  },
  {
    code: 'LESMIS_grade_11_dropout_rate__district_map',
    dataElements: 'dor_district_s6_t',
  },
  {
    code: 'LESMIS_grade_12_dropout_rate__district_map',
    dataElements: 'dor_district_s7_t',
  },
];

const REPORTS_OTHER = [
  'LESMIS_lowersecondary_repetition_rate_district_map',
  'LESMIS_primary_repetition_rate_district_map',
  'LESMIS_uppersecondary_repetition_rate_district_map',
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

  // set data for GPI presentation config
  await db.runSql(`
    UPDATE "mapOverlay" SET "presentationOptions" = jsonb_set("presentationOptions", '{scaleBounds}', '{"left": {"min": 0}, "right": {"max": 2}}') WHERE "id" = 'LESMIS_grade_6_repetition_rate_GPI_district_map';
  `);
  await db.runSql(`
    UPDATE "mapOverlay" SET "presentationOptions" = jsonb_set("presentationOptions", '{scaleBounds}', '{"left": {"min": 0}, "right": {"max": 2}}') WHERE "id" = 'LESMIS_grade_6_dropout_rate_GPI_district_map';
  `);
  // update json for data elements
  REPORTS.forEach(async ({ code, dataElements }) => {
    await db.runSql(`
      UPDATE "report" SET "config" = jsonb_set("config", '{fetch, dataElements}', '["${dataElements}"]') WHERE "code" = '${code}';
    `);
  });
  // update json for column value transform
  REPORTS.forEach(async ({ code }) => {
    await db.runSql(`
      UPDATE "report" SET "config" = jsonb_set("config", '{transform, 0,insert, value}','"=divide($value,100)"') WHERE "code" = '${code}';
    `);
  });

  REPORTS_OTHER.forEach(async code => {
    await db.runSql(`
      UPDATE "report" SET "config" = jsonb_set("config", '{transform, 0,insert, value}','"=divide($value,100)"') WHERE "code" = '${code}';
    `);
  });
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
