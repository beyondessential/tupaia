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
    CREATE TABLE dashboard_mailing_list (
      id TEXT PRIMARY KEY,
      dashboard_id TEXT NOT NULL,
      email TEXT NOT NULL,
      subscribe_date TIMESTAMPTZ NOT NULL DEFAULT now(),
      unsubscribe_date TIMESTAMPTZ DEFAULT NULL,
      FOREIGN KEY (dashboard_id) REFERENCES dashboard (id) ON UPDATE CASCADE ON DELETE RESTRICT
    )
  `);
};

exports.down = async function (db) {
  await db.runSql(`DROP TABLE dashboard_mailing_list`);
};

exports._meta = {
  version: 1,
};
