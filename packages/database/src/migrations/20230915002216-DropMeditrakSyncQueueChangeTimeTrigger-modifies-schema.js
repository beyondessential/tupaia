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

exports.up = function (db) {
  return db.runSql(`DROP TRIGGER IF EXISTS meditrak_sync_queue_trigger ON meditrak_sync_queue`);
};

exports.down = function (db) {
  return db.runSql(`
  create trigger meditrak_sync_queue_trigger before
  insert
      or
  update
      on
      public.meditrak_sync_queue for each row execute function update_change_time()
  `);
};

exports._meta = {
  version: 1,
};
