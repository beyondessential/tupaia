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
    CREATE TABLE access_request (
      id TEXT PRIMARY KEY,
      user_id text REFERENCES user_account(id),
      country_id text REFERENCES country(id),
      message text,
      permissionGroup text REFERENCES permission_group(name),
      created_time TIMESTAMPTZ NOT NULL DEFAULT now(),
      last_modified_time TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
};

exports.down = function(db) {
  return db.runSql(`
    DROP TABLE access_request CASCADE;
  `);
};

exports._meta = {
  "version": 1
};
