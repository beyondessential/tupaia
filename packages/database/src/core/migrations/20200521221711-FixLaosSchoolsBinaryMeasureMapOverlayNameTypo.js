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

const OLD_OVERLAY_ID = 'Laos_Schools_Schools_Provided_With_Hygiene_Kids';
const NEW_OVERLAY_ID = 'Laos_Schools_Schools_Provided_With_Hygiene_Kits';

const OLD_OVERLAY_NAME = 'Schools provided with hygiene kids';
const NEW_OVERLAY_NAME = 'Schools provided with hygiene kits';

exports.up = async function (db) {
  await db.runSql(`
    update "mapOverlay"
    set id = '${NEW_OVERLAY_ID}',
    name = '${NEW_OVERLAY_NAME}'
    where id='${OLD_OVERLAY_ID}';
  `);
};

exports.down = async function (db) {
  await db.runSql(`
    update "mapOverlay"
    set id = '${OLD_OVERLAY_ID}',
    name = '${OLD_OVERLAY_NAME}'
    where id='${NEW_OVERLAY_ID}';
  `);
};

exports._meta = {
  version: 1,
};
