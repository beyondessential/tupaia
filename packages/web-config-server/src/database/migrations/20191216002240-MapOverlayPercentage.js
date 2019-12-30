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

  await db.runSql(`update "mapOverlay" set "measureBuilderConfig" = "measureBuilderConfig" - 'valueType'
    where "measureBuilderConfig" ? 'valueType'`)

  await db.runSql(`update "mapOverlay" set "presentationOptions" = "presentationOptions" - 'valueType'
    where "presentationOptions" ->> 'valueType' like '2dp'`);

  return db.runSql(`
    UPDATE public."mapOverlay"
    SET  "presentationOptions"='{"scaleType": "performance", "valueType": "percentage"}'
    WHERE id='13';
    `);
};

exports.down = function(db) {
  return db.runSql(`
    UPDATE public."mapOverlay"
    SET  "presentationOptions"='{"scaleType": "performance"}'
    WHERE id='13';
    `);
};

exports._meta = {
  version: 1,
};
