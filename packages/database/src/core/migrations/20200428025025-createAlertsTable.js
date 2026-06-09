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
    CREATE TABLE alert (
      id TEXT PRIMARY KEY,
      entity_id text REFERENCES entity(id),
      data_element_id text REFERENCES data_source(id),
      start_time TIMESTAMPTZ NOT NULL DEFAULT now(),
      end_time TIMESTAMPTZ,
      event_confirmed_time TIMESTAMPTZ,
      archived boolean DEFAULT false
    );
  `);
};

exports.down = function (db) {
  return db.runSql('DROP TABLE alert CASCADE;');
};

exports._meta = {
  version: 1,
};
