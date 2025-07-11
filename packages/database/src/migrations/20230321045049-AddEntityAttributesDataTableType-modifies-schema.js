'use strict';

import { TupaiaDatabase } from '@tupaia/database';

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
  await db.executeSql(`ALTER TYPE data_table_type ADD VALUE 'entity_attributes'`);
  return db.closeConnections();
};

exports.down = async function () {};

exports._meta = {
  version: 1,
};
