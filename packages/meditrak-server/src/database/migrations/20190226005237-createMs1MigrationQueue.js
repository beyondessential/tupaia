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
    CREATE TABLE public.ms1_sync_queue (
      id text NOT NULL,
      type text NOT NULL,
      record_type text NOT NULL,
      record_id text NOT NULL,
      priority integer DEFAULT 1,
      details text,
      is_dead_letter boolean DEFAULT false,
      bad_request_count integer DEFAULT 1,
      change_time double precision DEFAULT (floor((date_part('epoch'::text, clock_timestamp()) * (1000)::double precision)) + ((nextval('public.change_time_seq'::regclass))::double precision / (100)::double precision)),
      is_deleted boolean DEFAULT false
    );
  `);
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
