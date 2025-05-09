'use strict';

import { TupaiaDatabase } from '../../server/TupaiaDatabase';
import { ModelRegistry } from '../ModelRegistry';
import { EntityHierarchyCacher } from '../../server/changeHandlers/entityHierarchyCacher/EntityHierarchyCacher';

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
  const hierarchyCacher = new EntityHierarchyCacher(models);
  await hierarchyCacher.buildAndCacheHierarchies();
  db.closeConnections();
  return null;
};

exports.down = function (db) {
  return db.runSql(`TRUNCATE TABLE ancestor_descendant_relation;`);
};

exports._meta = {
  version: 1,
};
