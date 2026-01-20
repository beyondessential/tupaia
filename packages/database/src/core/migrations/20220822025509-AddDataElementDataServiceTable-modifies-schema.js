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
    CREATE TABLE data_element_data_service (
      id TEXT PRIMARY KEY,
      data_element_code TEXT NOT NULL,
      country_code TEXT NOT NULL,
      service_type service_type NOT NULL,
      service_config JSONB NOT NULL DEFAULT '{}'
    )
  `);
};

exports.down = async function (db) {
  await db.runSql(`DROP TABLE data_element_data_service`);
};

exports._meta = {
  version: 1,
};
