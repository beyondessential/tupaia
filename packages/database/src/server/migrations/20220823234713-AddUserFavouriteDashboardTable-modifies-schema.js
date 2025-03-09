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
    CREATE TABLE user_favourite_dashboard_item (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      dashboard_item_id TEXT NOT NULL,      
      UNIQUE (user_id, dashboard_item_id),
      FOREIGN KEY (user_id) REFERENCES user_account (id) ON UPDATE CASCADE ON DELETE CASCADE,
      FOREIGN KEY (dashboard_item_id) REFERENCES dashboard_item (id) ON UPDATE CASCADE ON DELETE CASCADE

    );

    CREATE INDEX user_favourite_dashboard_item_user_id_idx ON user_favourite_dashboard_item USING btree (user_id);
  `);
};

exports.down = function (db) {
  return db.runSql(`
    DROP TABLE public.user_favourite_dashboard_item;
  `);
};

exports._meta = {
  version: 1,
};
