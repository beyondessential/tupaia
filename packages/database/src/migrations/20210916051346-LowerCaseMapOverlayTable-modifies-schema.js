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
  await db.runSql('ALTER TABLE "project" RENAME COLUMN "user_groups" TO "permission_groups";');
  await db.runSql('ALTER TABLE "mapOverlay" RENAME COLUMN "userGroup" TO "permission_group";');
  await db.runSql('ALTER TABLE "mapOverlay" RENAME COLUMN "linkedMeasures" TO "linked_measures";');
  await db.runSql('ALTER TABLE "mapOverlay" RENAME COLUMN "presentationOptions" TO "config";');
  await db.runSql('ALTER TABLE "mapOverlay" RENAME TO "map_overlay";');
};

exports.down = async function (db) {
  await db.runSql('ALTER TABLE "map_overlay" RENAME TO "mapOverlay";');
};

exports._meta = {
  version: 1,
};
