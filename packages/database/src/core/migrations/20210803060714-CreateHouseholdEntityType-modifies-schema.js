'use strict';

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
  await db.runSql(`
    ALTER TYPE public.entity_type ADD VALUE 'household';
  `);
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
