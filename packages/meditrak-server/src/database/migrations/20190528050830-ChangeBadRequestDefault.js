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
  return db.runSql(
    `
      DROP TRIGGER IF EXISTS dhis_sync_queue_trigger ON dhis_sync_queue;
      ALTER TABLE dhis_sync_queue ALTER COLUMN bad_request_count SET DEFAULT 0;
      UPDATE dhis_sync_queue SET bad_request_count = 0 WHERE bad_request_count = 1;
      CREATE TRIGGER dhis_sync_queue_trigger BEFORE INSERT OR UPDATE ON public.dhis_sync_queue FOR EACH ROW EXECUTE PROCEDURE public.update_change_time();
      DROP TRIGGER IF EXISTS ms1_sync_queue_trigger ON ms1_sync_queue;
      ALTER TABLE ms1_sync_queue ALTER COLUMN bad_request_count SET DEFAULT 0;
      UPDATE ms1_sync_queue SET bad_request_count = 0 WHERE bad_request_count = 1;
      CREATE TRIGGER ms1_sync_queue_trigger BEFORE INSERT OR UPDATE ON public.ms1_sync_queue FOR EACH ROW EXECUTE PROCEDURE public.update_change_time();
    `,
  );
};

exports.down = function(db) {
  return db.runSql(
    `
      DROP TRIGGER IF EXISTS dhis_sync_queue_trigger ON dhis_sync_queue;
      ALTER TABLE dhis_sync_queue ALTER COLUMN bad_request_count SET DEFAULT 1;
      UPDATE dhis_sync_queue SET bad_request_count = 1 WHERE bad_request_count = 0;
      CREATE TRIGGER dhis_sync_queue_trigger BEFORE INSERT OR UPDATE ON public.dhis_sync_queue FOR EACH ROW EXECUTE PROCEDURE public.update_change_time();
      DROP TRIGGER IF EXISTS ms1_sync_queue_trigger ON ms1_sync_queue;
      ALTER TABLE ms1_sync_queue ALTER COLUMN bad_request_count SET DEFAULT 1;
      UPDATE ms1_sync_queue SET bad_request_count = 1 WHERE bad_request_count = 0;
      CREATE TRIGGER ms1_sync_queue_trigger BEFORE INSERT OR UPDATE ON public.ms1_sync_queue FOR EACH ROW EXECUTE PROCEDURE public.update_change_time();
    `,
  );
};

exports._meta = {
  version: 1,
};
