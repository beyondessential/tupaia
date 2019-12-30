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

exports.up = async function(db) {
  return db.runSql(`
    ALTER TABLE "dashboardGroup" RENAME "viewMode" TO "project";
    ALTER TABLE "dashboardGroup" ALTER COLUMN "project" TYPE text;
    ALTER TABLE "dashboardGroup" ALTER COLUMN "project" SET DEFAULT 'explore';
    DROP TYPE view_mode cascade;
  `);
};

exports.down = function(db) {
  return db.runSql(`
    ALTER TABLE "dashboardGroup" RENAME "project" TO "viewMode";
    CREATE TYPE view_mode AS ENUM ('explore', 'disaster');
    ALTER TABLE "dashboardGroup" ALTER COLUMN "viewMode" DROP DEFAULT;
    ALTER TABLE "dashboardGroup" ALTER COLUMN "viewMode" TYPE view_mode USING CAST("viewMode" AS view_mode);
    ALTER TABLE "dashboardGroup" ALTER COLUMN "viewMode" SET DEFAULT 'explore';
`);
};

exports._meta = {
  version: 1,
};
