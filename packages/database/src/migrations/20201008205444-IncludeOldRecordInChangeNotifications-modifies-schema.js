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
  return db.runSql(`
    CREATE OR REPLACE FUNCTION public.notification() RETURNS trigger
      LANGUAGE plpgsql
    AS $$
    DECLARE
    new_json_record JSONB;
    old_json_record JSONB;
    BEGIN
    IF TG_OP = 'UPDATE' AND OLD = NEW THEN
      RETURN NULL;
    END IF;
    IF TG_OP = 'UPDATE' THEN
      old_json_record := public.scrub_geo_data(
        to_jsonb(OLD),
        TG_TABLE_NAME
      );
    END IF;
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
      new_json_record := public.scrub_geo_data(
        to_jsonb(NEW),
        TG_TABLE_NAME
      );
      PERFORM pg_notify(
        'change',
        json_build_object(
          'record_type',
          TG_TABLE_NAME,
          'record_id',
          NEW.id,
          'type',
          'update',
          'old_record',
          old_json_record,
          'new_record',
          new_json_record
        )::text
    );
      RETURN NEW;
    END IF;
    IF TG_OP = 'DELETE' THEN
      old_json_record := public.scrub_geo_data(
        to_jsonb(OLD),
        TG_TABLE_NAME
      );
      PERFORM pg_notify(
      'change',
      json_build_object(
        'record_type',
        TG_TABLE_NAME,
        'record_id',
        OLD.id,
        'type',
        'delete',
        'old_record',
        old_json_record,
        'new_record',
        NULL
    )::text);
      RETURN OLD;
    END IF;
    END;
    $$;
  `);
};

exports.down = function (db) {
  return db.runSql(`
    CREATE OR REPLACE FUNCTION public.notification() RETURNS trigger
      LANGUAGE plpgsql
      AS $$
    DECLARE
    json_record TEXT;
    BEGIN
    IF TG_OP = 'UPDATE' AND OLD = NEW THEN
      RETURN NULL;
    END IF;
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
      json_record := to_jsonb(NEW);
      PERFORM pg_notify(
        'change',
        json_build_object(
          'record_type',
          TG_TABLE_NAME,
          'record_id',
          NEW.id,
          'type',
          'update',
          'record',
          public.scrub_geo_data(
            json_record::jsonb,
            TG_TABLE_NAME
          )
        )::text
    );
      RETURN NEW;
    END IF;
    IF TG_OP = 'DELETE' THEN
      json_record := to_jsonb(OLD);
      PERFORM pg_notify(
      'change',
      json_build_object(
        'record_type',
        TG_TABLE_NAME,
        'record_id',
        OLD.id,
        'type',
        'delete',
        'record',
        public.scrub_geo_data(
          json_record::jsonb,
          TG_TABLE_NAME
        )
    )::text);
      RETURN OLD;
    END IF;
    END;
    $$;
  `);
};

exports._meta = {
  version: 1,
};
