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
  return db.runSql(`
    ALTER TABLE task
    RENAME COLUMN due_date TO old_due_date;

    ALTER TABLE task
    ADD COLUMN due_date DOUBLE PRECISION;

    UPDATE task
    SET due_date = (EXTRACT(EPOCH FROM old_due_date) * 1000)::DOUBLE PRECISION;

    ALTER TABLE task
    DROP COLUMN old_due_date;
  `);
};

exports.down = function (db) {
  return db.runSql(`
    ALTER TABLE task
    RENAME COLUMN due_date TO old_due_date;

    ALTER TABLE task
    ADD COLUMN due_date TIMESTAMP WITH TIME ZONE;

    UPDATE task
    SET due_date = to_timestamp(CAST(old_due_date AS DOUBLE PRECISION) / 1000);

    ALTER TABLE task
    DROP COLUMN old_due_date;
  `);
};

exports._meta = {
  version: 1,
};
