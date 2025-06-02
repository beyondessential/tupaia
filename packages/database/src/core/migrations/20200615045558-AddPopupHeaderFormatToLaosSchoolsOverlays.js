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
  return db.runSql(`
    update "mapOverlay"
    set "presentationOptions" = "presentationOptions" || '{"popupHeaderFormat": "{code}: {name}"}'::jsonb
    where "presentationOptions"::text like '%"measureLevel": "School"%'
    and "projectCodes" @> ARRAY['laos_schools'];
  `);
};

exports.down = async function (db) {
  return db.runSql(`
    update "mapOverlay"
    set "presentationOptions" = "presentationOptions" - 'popupHeaderFormat' 
    where "presentationOptions"::text like '%"measureLevel": "School"%'
    and "projectCodes" @> ARRAY['laos_schools'];
    `);
};

exports._meta = {
  version: 1,
};
