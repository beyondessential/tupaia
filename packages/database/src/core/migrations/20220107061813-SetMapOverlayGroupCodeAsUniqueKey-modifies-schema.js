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
  // 1. Delete duplicated map overlay group with code 'Root'.
  //    Have checked it doesn't have any children in overlay relation table.
  // 2. Set map overlay group code as unique key.
  return db.runSql(`
      DELETE FROM
        "map_overlay_group"
      WHERE
        "id" = 'Root';

      ALTER TABLE public.map_overlay_group ADD CONSTRAINT map_overlay_group_code_key UNIQUE (code);
`);
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
