'use strict';

import { updateValues } from '../utilities';

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

// Map Overlay Group code: Laos_Schools_Textbook_student_Ratio_Group_Id
const textbookStudentRatioMapOverlayGroupId = '5f6d391a61f76a728e000011';
const scaleColorScheme = 'default-reverse';

async function getMapOverlayById(db, id) {
  const { rows: MapOverlays } = await db.runSql(`
      SELECT * FROM "mapOverlay"
      WHERE id = '${id}';
  `);
  return MapOverlays[0] || null;
}

async function findMapOverlayIds(db, mapOverlayGroupId) {
  const { rows: mapOverlayGroupRelation } = await db.runSql(`
  SELECT * FROM "map_overlay_group_relation"
  WHERE map_overlay_group_id = '${mapOverlayGroupId}';
`);

  if (mapOverlayGroupRelation.length === 0) return mapOverlayGroupId;
  return Promise.all(
    mapOverlayGroupRelation.map(relation => findMapOverlayIds(db, relation.child_id)),
  );
}

exports.up = async function (db) {
  const mapOverlayIds = (await findMapOverlayIds(db, textbookStudentRatioMapOverlayGroupId)).flat(
    Infinity,
  );

  for (const mapOverlayId of mapOverlayIds) {
    const mapOverlay = await getMapOverlayById(db, mapOverlayId);
    const { presentationOptions } = mapOverlay;
    presentationOptions.scaleColorScheme = scaleColorScheme;
    await updateValues(
      db,
      'mapOverlay',
      { presentationOptions: { ...presentationOptions, scaleColorScheme } },
      { id: mapOverlayId },
    );
  }
};

exports.down = async function (db) {
  const mapOverlayIds = (await findMapOverlayIds(db, textbookStudentRatioMapOverlayGroupId)).flat(
    Infinity,
  );

  for (const mapOverlayId of mapOverlayIds) {
    const mapOverlay = await getMapOverlayById(db, mapOverlayId);
    const { presentationOptions } = mapOverlay;
    delete presentationOptions.scaleColorScheme;
    await updateValues(db, 'mapOverlay', { presentationOptions }, { id: mapOverlayId });
  }
};

exports._meta = {
  version: 1,
};
