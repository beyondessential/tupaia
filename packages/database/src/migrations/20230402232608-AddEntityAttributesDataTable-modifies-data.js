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

const ENTITY_ATTRIBUTES = {
  id: generateId(),
  code: 'entity_attributes',
  description: 'Entity attributes',
  config: {},
  permission_groups: '{*}',
  type: 'entity_attributes',
};

exports.up = async function (db) {
  await insertObject(db, 'data_table', ENTITY_ATTRIBUTES);
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
