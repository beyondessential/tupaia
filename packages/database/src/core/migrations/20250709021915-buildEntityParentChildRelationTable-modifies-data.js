'use strict';

const { TupaiaDatabase, ModelRegistry } = require('../../server');
const {
  EntityParentChildRelationBuilder,
} = require('../../server/changeHandlers/entityHierarchyCacher/EntityParentChildRelationBuilder');

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

exports.up = async function () {
  const db = new TupaiaDatabase();
  const models = new ModelRegistry(db);
  const entityParentChildRelationBuilder = new EntityParentChildRelationBuilder(models);
  await entityParentChildRelationBuilder.buildAndCacheHierarchies();
  db.closeConnections();
  return null;
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
  targets: ['server'],
};
