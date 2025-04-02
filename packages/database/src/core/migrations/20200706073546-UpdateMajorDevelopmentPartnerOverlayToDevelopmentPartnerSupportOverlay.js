'use strict';

import { arrayToDbString } from '../utilities';

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
  'Laos_Schools_Major_Dev_Partner_Province',
  'Laos_Schools_Major_Dev_Partner_District',
];

const OLD_OVERLAY_NAME = 'Major Development Partner';

const NEW_OVERLAY_NAME = 'Development partner support';

exports.up = async function (db) {
  return db.runSql(`
    UPDATE "mapOverlay"
    SET name = '${NEW_OVERLAY_NAME}'
    WHERE id in (${arrayToDbString(MAP_OVERLAY_IDS)});
  `);
};

exports.down = async function (db) {
  return db.runSql(`
    UPDATE "mapOverlay"
    SET name = '${OLD_OVERLAY_NAME}'
    WHERE id in (${arrayToDbString(MAP_OVERLAY_IDS)});
  `);
};

exports._meta = {
  version: 1,
};
