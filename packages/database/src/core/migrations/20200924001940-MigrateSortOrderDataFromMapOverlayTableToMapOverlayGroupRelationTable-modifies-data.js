'use strict';

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

const selectAllMapOverlays = async db => db.runSql('SELECT * FROM "mapOverlay";');

exports.up = async function (db) {
  const mapOverlays = await selectAllMapOverlays(db);

  for (let i = 0; i < mapOverlays.rows.length; i++) {
    const { sortOrder, id: mapOverlayId } = mapOverlays.rows[i];

    await db.runSql(`
      UPDATE map_overlay_group_relation
      SET sort_order = ${sortOrder}
      WHERE child_id = '${mapOverlayId}'
      AND child_type = 'mapOverlay';
    `);
  }
};

exports.down = async function (db) {
  await db.runSql(`
    UPDATE map_overlay_group_relation
    SET sort_order = NULL
    WHERE child_type = 'mapOverlay';
  `);
};

exports._meta = {
  version: 1,
};
