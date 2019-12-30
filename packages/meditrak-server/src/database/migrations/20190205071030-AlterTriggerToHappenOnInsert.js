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
    DROP TRIGGER IF EXISTS meditrak_sync_queue_trigger ON meditrak_sync_queue;
    DROP TRIGGER IF EXISTS dhis_sync_queue_trigger ON dhis_sync_queue;
    CREATE TRIGGER meditrak_sync_queue_trigger BEFORE INSERT OR UPDATE ON public.meditrak_sync_queue FOR EACH ROW EXECUTE PROCEDURE public.update_change_time();
    CREATE TRIGGER dhis_sync_queue_trigger BEFORE INSERT OR UPDATE ON public.dhis_sync_queue FOR EACH ROW EXECUTE PROCEDURE public.update_change_time();
  `);
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
