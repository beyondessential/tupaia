'use strict';

import { arrayToDbString } from '../utilities';

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
  const internalDataTables = (await db.runSql("SELECT * FROM data_table WHERE type = 'internal'"))
    .rows;

  const newEnum = internalDataTables.map(dt => dt.code);
  await db.runSql(
    `
      ALTER TYPE data_table_type RENAME TO data_table_type_temp$;
      CREATE TYPE data_table_type AS ENUM(${arrayToDbString(newEnum)});
      ALTER TABLE data_table DROP COLUMN type;
      ALTER TABLE data_table ADD COLUMN type data_table_type;
      DROP TYPE data_table_type_temp$;
    `,
  );

  for (let i = 0; i < internalDataTables.length; i++) {
    const dataTable = internalDataTables[i];
    await db.runSql(`UPDATE data_table SET type = ? WHERE code = ?;`, [
      dataTable.code,
      dataTable.code,
    ]);
  }

  await db.runSql(
    `
    ALTER TYPE data_table_type ADD VALUE 'sql';
    `,
  );
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
