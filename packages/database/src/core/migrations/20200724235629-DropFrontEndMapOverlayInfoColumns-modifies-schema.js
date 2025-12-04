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
  await db.runSql(`
    ALTER TABLE "mapOverlay" 
    DROP COLUMN "displayType", 
    DROP COLUMN "customColors", 
    DROP COLUMN "values", 
    DROP COLUMN "hideFromMenu", 
    DROP COLUMN "hideFromPopup", 
    DROP COLUMN "hideFromLegend",
    ALTER COLUMN "presentationOptions" SET NOT NULL,
    ALTER COLUMN "presentationOptions" SET DEFAULT '{}';
`);
};

exports.down = async function (db) {
  await db.runSql(`
    ALTER TABLE "mapOverlay" 
    ADD COLUMN "displayType" text, 
    ADD COLUMN "customColors" text,
    ADD COLUMN "values" jsonb, 
    ADD COLUMN "hideFromMenu" boolean, 
    ADD COLUMN "hideFromPopup" boolean,
    ADD COLUMN "hideFromLegend" boolean,
    ALTER COLUMN "presentationOptions" DROP NOT NULL,
    ALTER COLUMN "presentationOptions" DROP DEFAULT;
`);
};

exports._meta = {
  version: 1,
};
