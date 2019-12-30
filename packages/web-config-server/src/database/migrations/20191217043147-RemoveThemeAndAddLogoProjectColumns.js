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
    ALTER TABLE "project" DROP COLUMN "theme";
    ALTER TABLE "project" ADD COLUMN "logo_url" TEXT;
  `);
};

exports.down = function(db) {
  return db.runSql(`
    ALTER TABLE "project" DROP COLUMN "logo_url";
    ALTER TABLE "project" ADD COLUMN 'theme' jsonb NOT NULL default '{"text":"#000000","background":"#ffffff"}'::jsonb;
  `);
};

exports._meta = {
  version: 1,
};
