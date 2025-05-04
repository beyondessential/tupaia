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
  // This will take out any registered fields in
  // the geography_columns table (as created by POSTGIS)
  await db.runSql(`
    CREATE OR REPLACE FUNCTION public.scrub_geo_data(
      current_record JSONB = NULL,
      TG_TABLE_NAME NAME = NULL
    )
      RETURNS JSON AS
    $$
    DECLARE
      geo_entities RECORD;
    BEGIN
      IF current_record IS NULL THEN
        RETURN '{}';
      END IF;
      FOR geo_entities IN
        SELECT f_table_name, f_geography_column
        FROM geography_columns
        WHERE type in ('Polygon', 'MultiPolygon')
        AND f_table_name = TG_TABLE_NAME LOOP
          -- will remove columns with geo data
          current_record := current_record::jsonb - geo_entities.f_geography_column;
      END LOOP;
    RETURN current_record;
    END;
    $$
    LANGUAGE plpgsql;
  `);
  await db.runSql(`
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

exports.down = function (db) {
  return db.runSql(`
    CREATE OR REPLACE FUNCTION public.notification() RETURNS trigger
      LANGUAGE plpgsql
      AS $$
    BEGIN
    IF TG_OP = 'UPDATE' AND OLD = NEW THEN
      RETURN NULL;
    END IF;
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
      PERFORM pg_notify(
        'change',
        json_build_object(
          'record_type',
          TG_TABLE_NAME,
          'record_id',
          NEW.id,
          'type',
          'update'
        )::text
    );
      RETURN NEW;
    END IF;
    IF TG_OP = 'DELETE' THEN
      PERFORM pg_notify(
      'change',
      json_build_object(
        'record_type',
        TG_TABLE_NAME,
        'record_id',
        OLD.id,
        'type',
        'delete'
      )::text
    );
      RETURN OLD;
    END IF;
    END;
    $$;

    DROP FUNCTION public.scrub_geo_data(JSONB, NAME);
  `);
};

exports._meta = {
  version: 1,
};
