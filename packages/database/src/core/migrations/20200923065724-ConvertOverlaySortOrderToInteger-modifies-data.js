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

const INTERNATIONAL_HEALTH_REGULATIONS_OVERLAYS_ORDERED = [
  '174',
  '175',
  '176',
  '177',
  '178',
  '179',
  '180',
  '181',
  '182',
  '183',
  '184',
  '185',
  '186',
  '187',
];

const DISASTER_RESPONSE_OVERLAYS_ORDERED = ['194', '188'];

const reorderGroupOverlays = async (db, overlayOrders) => {
  for (let index = 0; index < overlayOrders.length; index++) {
    const overlayId = overlayOrders[index];
    await db.runSql(`
      UPDATE "mapOverlay"
      SET "sortOrder" = ${index}
      WHERE id = '${overlayId}'
    `);
  }
};

exports.up = async function (db) {
  await reorderGroupOverlays(db, INTERNATIONAL_HEALTH_REGULATIONS_OVERLAYS_ORDERED);

  await reorderGroupOverlays(db, DISASTER_RESPONSE_OVERLAYS_ORDERED);
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
