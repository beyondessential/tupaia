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
    ALTER SEQUENCE public.change_time_seq
    START 100
    MINVALUE 100; -- because we use this as a decimal, 1 - 99 clash with later values e.g. 0.200 = 0.20 = 0.2

    CREATE OR REPLACE FUNCTION public.update_change_time() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    BEGIN
      NEW.change_time = floor(extract(epoch from clock_timestamp()) * 1000) + (CAST (nextval('change_time_seq') AS FLOAT)/1000);
      RETURN NEW;
    END;
    $$;
  `);
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
