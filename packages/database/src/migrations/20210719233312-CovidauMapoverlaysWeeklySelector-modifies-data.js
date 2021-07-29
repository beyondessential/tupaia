'use strict';

import { arrayToDbString } from '../utilities/migration';

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

const mapOverlayGroups = [
  'Flutracking Australia',
  'Flutracking Australia (LGA level)',
  'COVID-19 Australia',
];

const excludedMapOverlay = 'COVID_AU_HOSPITALS_AND_TESTING_SITES';

const getMapOverlayIds = async db => {
  return (
    await db.runSql(`
      SELECT mo.id FROM "mapOverlay" mo 
      JOIN map_overlay_group_relation mogr 
      ON mo.id = mogr.child_id 
      JOIN map_overlay_group mog 
      ON mog.id = mogr.map_overlay_group_id 
      WHERE mog.name in (${arrayToDbString(mapOverlayGroups)})
      AND mo.id != '${excludedMapOverlay}'; 
  `)
  ).rows.map(({ id }) => id);
};

exports.up = async function (db) {
  const mapOverlayIds = await getMapOverlayIds(db);
  await db.runSql(`
      UPDATE "mapOverlay" 
      SET "presentationOptions" = "presentationOptions" || '{"periodGranularity": "one_week_at_a_time"}'::jsonb
      WHERE id in (${arrayToDbString(mapOverlayIds)});
  `);
};

exports.down = async function (db) {
  const mapOverlayIds = await getMapOverlayIds(db);
  await db.runSql(`
      UPDATE "mapOverlay"
      SET "presentationOptions" = "presentationOptions"::jsonb #- '{periodGranularity}'
      WHERE id in (${arrayToDbString(mapOverlayIds)});
`);
};

exports._meta = {
  version: 1,
};
