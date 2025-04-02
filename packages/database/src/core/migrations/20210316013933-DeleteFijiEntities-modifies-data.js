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

const FACILITIES_TO_REMOVE = [
  'FJ_066',
  'FJ_094',
  'FJ_101',
  'FJ_106',
  'FJ_149',
  'FJ_234',
  'FJ_237',
  'FJ_249',
  'FJ-01_HC_Punjas',
  'FJ_026',
  'FJ_044',
  'FJ_224',
  'FJ_239',
  'FJ_240',
  'FJ_241',
  'FJ_242',
];

exports.up = async function (db) {
  await db.runSql(`
    DELETE FROM "clinic" WHERE "code" in (${arrayToDbString(FACILITIES_TO_REMOVE)});
    DELETE FROM "entity" WHERE "code" in (${arrayToDbString(FACILITIES_TO_REMOVE)});
`);
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
