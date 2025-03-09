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
  await db.runSql(`ALTER TABLE refresh_token ADD COLUMN meditrak_device_id text`);
  return db.runSql(`
    ALTER TABLE
      refresh_token
    ADD CONSTRAINT
      refresh_token_meditrak_device_id_fk FOREIGN KEY (meditrak_device_id)
        REFERENCES meditrak_device (id)
        ON UPDATE CASCADE ON DELETE CASCADE;
    `);
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
