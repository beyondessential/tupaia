'use strict';

import { generateId, insertObject } from '../utilities';

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

const SUPERSET_INSTANCES = [
  {
    id: generateId(),
    code: 'msupply-fj',
    config: {
      baseUrl: 'https://superset-fiji.msupply.org:8088',
      insecure: true,
    },
  },
  {
    id: generateId(),
    code: 'msupply-fj-unfpa',
    config: {
      baseUrl: 'https://superset-fiji-unfpa.msupply.org:8088',
      insecure: true,
    },
  },
];

exports.up = async function (db) {
  for (const instance of SUPERSET_INSTANCES) {
    await insertObject(db, 'superset_instance', instance);
  }
};

exports.down = async function (db) {
  for (const instance of SUPERSET_INSTANCES) {
    await db.runSql(`DELETE FROM superset_instance WHERE code = '${instance.code}'`);
  }
};

exports._meta = {
  version: 1,
};
