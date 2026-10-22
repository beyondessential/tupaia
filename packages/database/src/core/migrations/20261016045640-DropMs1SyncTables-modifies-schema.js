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
    DROP TABLE IF EXISTS ms1_sync_queue;
    DROP TABLE IF EXISTS ms1_sync_log;
  `);
};

/**
 * - Restores the schema only; dropped rows not recoverable.
 * - Prior to this migration `id` wasn’t enforced as primary key in either table. Should’ve been,
 *   though.
 */
exports.down = async function (db) {
  await db.runSql(`
    CREATE TABLE ms1_sync_log (
      id TEXT PRIMARY KEY,
      record_type TEXT NOT NULL,
      record_id TEXT NOT NULL UNIQUE,
      count INTEGER DEFAULT 1,
      error_list TEXT,
      endpoint TEXT,
      data TEXT
    );
    CREATE TRIGGER ms1_sync_log_trigger
      AFTER DELETE OR INSERT OR UPDATE ON ms1_sync_log
      FOR EACH ROW
      EXECUTE PROCEDURE notification();

    CREATE TABLE ms1_sync_queue (
      id text PRIMARY KEY,
      type TEXT NOT NULL,
      record_type text NOT NULL,
      record_id text NOT NULL UNIQUE,
      priority integer DEFAULT 1,
      details text,
      is_dead_letter boolean DEFAULT FALSE,
      bad_request_count integer DEFAULT 0,
      change_time double precision DEFAULT (floor(date_part('epoch', clock_timestamp()) * 1000) + (nextval('change_time_seq')::double precision / 100)),
      is_deleted boolean DEFAULT FALSE
    );

    CREATE TRIGGER ms1_sync_queue_trigger
      AFTER DELETE OR INSERT OR UPDATE ON public.ms1_sync_queue
      FOR EACH ROW
      EXECUTE PROCEDURE notification();

    DO $$
    BEGIN
      IF EXISTS (SELECT FROM pg_roles WHERE rolname = 'tupaia_read') THEN
        GRANT SELECT ON TABLE ms1_sync_log, ms1_sync_queue TO tupaia_read;
      END IF;
    END
    $$;
  `);
};

exports._meta = {
  version: 1,
  targets: ['server'],
};
