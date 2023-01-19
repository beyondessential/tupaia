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
  // Copy sync_cursor over to data_service_sync_group
  const internalDataTables = (await db.runSql("SELECT * FROM data_table WHERE type = 'internal'"))
    .rows;
  for (let i = 0; i < internalDataTables; i++) {
    const dataTable = internalDataTables[i];
    await db.runSql(
      `
      ALTER TYPE data_table_type ADD VALUE ?;
    `,
      [dataTable.code],
    );
    await db.runSql(
      `
      UPDATE data_table SET type = ? WHERE code = ?;
    `,
      [dataTable.code, dataTable.code],
    );
  }
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
