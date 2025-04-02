'use strict';

const { generateId, insertObject } = require('../utilities');

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
    code: 'msupply-kiribati-vax',
    config: {
      baseUrl: 'https://superset-kiribati-vax.msupply.org:8088',
    },
  },
  {
    id: generateId(),
    code: 'msupply-samoa',
    config: {
      baseUrl: 'https://superset-samoa.msupply.org:8088',
    },
  },
  {
    id: generateId(),
    code: 'msupply-tonga-vax',
    config: {
      baseUrl: 'https://superset-tonga-vax.msupply.org:8088',
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
