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
    ALTER TABLE data_element
    ADD CONSTRAINT valid_data_service_config CHECK (service_type <> 'dhis' OR config->'dhisInstanceCode'::text <> 'null');
  `);
  await db.runSql(`
    ALTER TABLE data_group
    ADD CONSTRAINT valid_data_service_config CHECK (service_type <> 'dhis' OR config->'dhisInstanceCode'::text <> 'null');
  `);
};

exports.down = async function (db) {
  await db.runSql(`
    ALTER TABLE data_element
    DROP CONSTRAINT valid_data_service_config
  `);
  await db.runSql(`
    ALTER TABLE data_group
    DROP CONSTRAINT valid_data_service_config
  `);
};

exports._meta = {
  version: 1,
};
