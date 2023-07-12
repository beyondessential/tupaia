'use strict';

import { arrayToDbString } from '../utilities';

var dbm;
var type;
var seed;

const ORPHAN_OVERLAY_IDS = [
  'Laos_Schools_Electricity_Available',
  'Laos_Schools_Functioning_Notebook_Laptop',
  'Laos_Schools_When_Was_Computer_Provided',
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

exports.up = async function (db) {
  await db.runSql(`
    DELETE FROM map_overlay_group_relation
    WHERE child_id IN (${arrayToDbString(ORPHAN_OVERLAY_IDS)});
  `);
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
