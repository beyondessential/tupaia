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

const TABLES = ['data_element', 'data_group'];

exports.up = async function (db) {
  for (const table of TABLES) {
    // If any data elements or groups have not been updated to use a specific dhis instance, we set them to NOT_SET so we can add the constraint
    await db.runSql(`
      UPDATE ${table} SET config = (config || '{"dhisInstanceCode": "NOT_SET"}')
      WHERE service_type = 'dhis' AND config->>'dhisInstanceCode'::text is null;
    `);

    // Add constraint
    await db.runSql(`
      ALTER TABLE ${table}
      ADD CONSTRAINT valid_data_service_config CHECK (service_type <> 'dhis' OR config->>'dhisInstanceCode'::text is not null);
    `);
  }
};

exports.down = async function (db) {
  for (const table of TABLES) {
    // Remove constraint
    await db.runSql(`
      ALTER TABLE ${table}
      DROP CONSTRAINT valid_data_service_config
    `);

    // Revert data thing
    await db.runSql(`
      UPDATE ${table} SET config = (config || '{"dhisInstanceCode": null}')
      WHERE service_type = 'dhis' AND config->>'dhisInstanceCode' = 'NOT_SET';
    `);
  }
};

exports._meta = {
  version: 1,
};
