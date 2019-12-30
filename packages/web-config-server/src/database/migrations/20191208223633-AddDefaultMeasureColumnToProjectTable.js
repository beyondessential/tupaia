'use strict';

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function(db) {
  return db.runSql(`
    UPDATE "mapOverlay"
    SET "presentationOptions" = NULL
    WHERE id IN ('193', '126');

    ALTER TABLE "project"
    ADD COLUMN "default_measure" TEXT DEFAULT '126,171';
  `);
};

exports.down = function(db) {
  return db.runSql(`
  UPDATE "mapOverlay"
  SET "presentationOptions" = '{"default": "explore"}'
  WHERE id = '126';

  UPDATE "mapOverlay"
  SET "presentationOptions" = '{"default": "disaster"}'
  WHERE id = '193';

  ALTER TABLE "project"
  DROP COLUMN "default_measure";
`);
};

exports._meta = {
  version: 1,
};
