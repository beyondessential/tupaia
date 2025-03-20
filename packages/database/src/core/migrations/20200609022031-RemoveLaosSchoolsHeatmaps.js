'use strict';

import { arrayToDbString } from '../utilities';

var dbm;
var type;
var seed;

const OVERLAY_IDS = [
  'Laos_Schools_Children_Supported_With_TV_Programmes_Radio',
  'Laos_Schools_Children_Supported_With_Learning_Materials',
  'Laos_Schools_Children_Provided_Psychosocial_Support',
];

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function (db) {
  return db.runSql(`
    DELETE FROM "mapOverlay"
    WHERE id IN (${arrayToDbString(OVERLAY_IDS)})
  `);
};

exports.down = function (db) {
  // No down migration
};

exports._meta = {
  version: 1,
};
