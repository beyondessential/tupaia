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

exports.up = async function (db) {
  await db.runSql(
    'ALTER TABLE "public"."project" ALTER COLUMN "entity_hierarchy_id" SET NOT NULL;',
  );
};

exports.down = async function (db) {
  await db.runSql(
    'ALTER TABLE "public"."project" ALTER COLUMN "entity_hierarchy_id" DROP NOT NULL;',
  );
};

exports._meta = {
  version: 1,
};
