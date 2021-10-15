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
  await db.runSql('ALTER TABLE "mapOverlay" RENAME COLUMN "countryCodes" TO "country_codes";');
  await db.runSql('ALTER TABLE "mapOverlay" RENAME COLUMN "projectCodes" TO "project_codes";');
  await db.runSql(
    `ALTER TABLE "mapOverlay" ADD COLUMN data_services JSONB DEFAULT '[{"isDataRegional": true}]';`,
  );
  await db.runSql(`
    UPDATE "mapOverlay"
    SET "data_services" = '[{"isDataRegional": false}]'
    WHERE "isDataRegional" = false;
  `);
  await db.runSql('ALTER TABLE "mapOverlay" DROP COLUMN "isDataRegional";');
  await db.runSql('ALTER TABLE "mapOverlay" RENAME TO "map_overlay";');
};

exports.down = async function (db) {
  await db.runSql('ALTER TABLE "map_overlay" RENAME TO "mapOverlay";');
  await db.runSql('ALTER TABLE "project" RENAME COLUMN "permission_groups" TO "user_groups";');
  await db.runSql('ALTER TABLE "mapOverlay" RENAME COLUMN "permission_group" TO "userGroup";');
  await db.runSql('ALTER TABLE "mapOverlay" RENAME COLUMN "linked_measures" TO "linkedMeasures";');
  await db.runSql('ALTER TABLE "mapOverlay" RENAME COLUMN "config" TO "presentationOptions";');
  await db.runSql('ALTER TABLE "mapOverlay" RENAME COLUMN "country_codes" TO "countryCodes";');
  await db.runSql('ALTER TABLE "mapOverlay" RENAME COLUMN "project_codes" TO "projectCodes";');
  await db.runSql(`ALTER TABLE "mapOverlay" ADD COLUMN "isDataRegional" boolean DEFAULT true;`);
  await db.runSql(`
    UPDATE "mapOverlay"
    SET "isDataRegional" = false
    WHERE "data_services"->0->'isDataRegional' = 'false';
  `);
  await db.runSql('ALTER TABLE "mapOverlay" DROP COLUMN "data_services";');
};

exports._meta = {
  version: 1,
};
