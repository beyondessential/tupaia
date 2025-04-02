'use strict';

import { arrayToDbString } from '../utilities';

var dbm;
var type;
var seed;

const MAP_OVERLAY_IDS = [
  'Laos_Schools_Major_Dev_Partner_Province',
  'Laos_Schools_Major_Dev_Partner_District',
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
    update "mapOverlay" mo
    set "measureBuilderConfig" = regexp_replace(mo."measureBuilderConfig"::text, '"valueToMatch": "Yes"','"condition": 1','g')::jsonb
    where id in (${arrayToDbString(MAP_OVERLAY_IDS)})
  `);
};

exports.down = async function (db) {
  await db.runSql(`
    update "mapOverlay" mo
    set "measureBuilderConfig" = regexp_replace(mo."measureBuilderConfig"::text, '"condition": 1','"valueToMatch": "Yes"','g')::jsonb
    where id in (${arrayToDbString(MAP_OVERLAY_IDS)})
  `);
};

exports._meta = {
  version: 1,
};
