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

const entityCodes = [
  'FJ_PROV_Ba',
  'FJ_PROV_Bua',
  'FJ_PROV_Cakaudrove',
  'FJ_PROV_Kadavu',
  'FJ_PROV_Lau',
  'FJ_PROV_Lomaiviti',
  'FJ_PROV_Macuata',
  'FJ_PROV_Nadroga_Navosa',
  'FJ_PROV_Naitasiri',
  'FJ_PROV_Namosi',
  'FJ_PROV_Ra',
  'FJ_PROV_Rewa',
  'FJ_PROV_Rotuma',
  'FJ_PROV_Serua',
  'FJ_PROV_Tailevu',
];

exports.up = async function (db) {
  return db.runSql(
    `UPDATE entity SET type = 'wish_sub_district' where code in (${arrayToDbString(entityCodes)});`,
  );
};

exports.down = async function (db) {
  return db.runSql(
    `UPDATE entity SET type = 'sub_district' where code in (${arrayToDbString(entityCodes)});`,
  );
};

exports._meta = {
  version: 1,
};
