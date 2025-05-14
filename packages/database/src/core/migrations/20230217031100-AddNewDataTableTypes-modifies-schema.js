'use strict';

import { arrayToDbString } from '../utilities/migration';

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

const newTypes = ['data_group_metadata', 'data_element_metadata'];

exports.up = async function (db) {
  const query = newTypes
    .map(t => `ALTER TYPE public.data_table_type ADD VALUE IF NOT EXISTS '${t}'`)
    .join(';');
  await db.runSql(query);
};

exports.down = async function (db) {
  const { rows: dataTableTypesResults } = await db.runSql(
    `SELECT unnest(enum_range(NULL::data_table_type));`,
  );
  const existingDataTableTypes = dataTableTypesResults.flatMap(r => Object.values(r));

  const { rows: dataTableRecords } = await db.runSql(
    `SELECT * FROM data_table WHERE type NOT IN (${arrayToDbString(newTypes)});`,
  );

  await db.runSql(
    `
      ALTER TYPE data_table_type RENAME TO data_table_type_temp$;
      CREATE TYPE data_table_type AS ENUM(${arrayToDbString(
        existingDataTableTypes.filter(t => !newTypes.includes(t)),
      )});
      ALTER TABLE data_table DROP COLUMN type;
      ALTER TABLE data_table ADD COLUMN type data_table_type;
      DROP TYPE data_table_type_temp$;
    `,
  );

  for (const dataTableRecord of dataTableRecords) {
    await db.runSql(
      `
      UPDATE data_table 
      SET type = '${dataTableRecord.type}'
      WHERE id = '${dataTableRecord.id}'
    `,
    );
  }

  await db.runSql(
    `
      ALTER TABLE data_table ALTER COLUMN type SET NOT NULL;
    `,
  );
};

exports._meta = {
  version: 1,
};
