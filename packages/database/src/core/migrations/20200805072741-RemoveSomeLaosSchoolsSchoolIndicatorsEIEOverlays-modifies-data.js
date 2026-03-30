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

const OVERLAYS = [
  'Laos_Schools_Disinfected_By_District_Health_Office',
  'Laos_Schools_Schools_Used_As_Quarantine',
];

exports.up = async function (db) {
  await db.runSql(`
    DELETE FROM "mapOverlay"
    WHERE id IN (${arrayToDbString(OVERLAYS)});

    DELETE FROM map_overlay_group_relation
    WHERE child_id IN (${arrayToDbString(OVERLAYS)});
  `);
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
