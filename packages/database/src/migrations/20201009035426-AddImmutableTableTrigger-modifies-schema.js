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
    CREATE OR REPLACE FUNCTION immutable_table()
    RETURNS trigger AS
    $$
      BEGIN
        IF TG_OP = 'UPDATE' AND OLD <> NEW THEN
          RAISE EXCEPTION 'Cannot update immutable table';
        END IF;
      END
    $$
    LANGUAGE plpgsql;
  `);
};

exports.down = function (db) {
  return db.runSql(`
    DROP FUNCTION IF EXISTS immutable_table() CASCADE;
  `);
};

exports._meta = {
  version: 1,
};
