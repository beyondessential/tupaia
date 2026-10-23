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

const REMAINING_SERVICE_TYPES = ['dhis', 'tupaia', 'indicator', 'weather', 'kobo', 'superset'];

/** Columns of type `service_type`, and how to identify offending rows in the error message */
const SERVICE_TYPE_COLUMNS = [
  { table: 'data_element', identifier: 'code' },
  {
    table: 'data_element_data_service',
    identifier: "data_element_code || ' (' || country_code || ')'",
  },
  { table: 'data_group', identifier: 'code' },
];

/**
 * These reference `'dhis'::service_type`, which would bind to the renamed old type and break the
 * column type change, so they’re dropped and recreated around it.
 */
const VALID_DATA_SERVICE_CONFIG_CONSTRAINTS = [
  { table: 'data_element', configColumn: 'config' },
  { table: 'data_element_data_service', configColumn: 'service_config' },
  { table: 'data_group', configColumn: 'config' },
];

const assertNoDataLakeRecords = async db => {
  const offenders = [];
  for (const { table, identifier } of SERVICE_TYPE_COLUMNS) {
    const { rows } = await db.runSql(
      `SELECT ${identifier} AS identifier FROM ${table} WHERE service_type = 'data-lake';`,
    );
    if (rows.length > 0) {
      offenders.push(`${table}: ${rows.map(row => row.identifier).join(', ')}`);
    }
  }

  if (offenders.length > 0) {
    throw new Error(
      `Cannot remove 'data-lake' service type while records still use it. Delete or migrate these first:\n${offenders.join('\n')}`,
    );
  }
};

exports.up = async function (db) {
  await assertNoDataLakeRecords(db);

  await db.runSql(`
    ${VALID_DATA_SERVICE_CONFIG_CONSTRAINTS.map(
      ({ table }) => `ALTER TABLE ${table} DROP CONSTRAINT valid_data_service_config;`,
    ).join('\n')}

    ALTER TYPE service_type RENAME TO service_type_old;
    CREATE TYPE service_type AS ENUM (${REMAINING_SERVICE_TYPES.map(t => `'${t}'`).join(', ')});

    ${SERVICE_TYPE_COLUMNS.map(
      ({ table }) =>
        `ALTER TABLE ${table} ALTER COLUMN service_type TYPE service_type USING service_type::text::service_type;`,
    ).join('\n')}

    ${VALID_DATA_SERVICE_CONFIG_CONSTRAINTS.map(
      ({ table, configColumn }) => `
        ALTER TABLE ${table}
        ADD CONSTRAINT valid_data_service_config
        CHECK (service_type <> 'dhis'::service_type OR (${configColumn} ->> 'dhisInstanceCode') IS NOT NULL);
      `,
    ).join('\n')}

    DROP TYPE service_type_old;
  `);
};

/** Restores the enum value only */
exports.down = async function (db) {
  await db.runSql(`ALTER TYPE service_type ADD VALUE IF NOT EXISTS 'data-lake';`);
};

exports._meta = {
  version: 1,
  targets: ['server'],
};
