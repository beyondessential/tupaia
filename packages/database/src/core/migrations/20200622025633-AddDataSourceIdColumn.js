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

const addDataSourceIdColumn = async (db, tableName, dataSourceType) => {
  await db.addColumn(tableName, 'data_source_id', { type: 'text' });
  await db.runSql(`
    ALTER TABLE ${tableName}
    ADD CONSTRAINT ${tableName}_data_source_id_fkey
    FOREIGN KEY (data_source_id)
    REFERENCES data_source (id)
  `);
  await db.runSql(`
    UPDATE ${tableName}
    SET data_source_id = data_source.id
    FROM data_source
    WHERE data_source.code = ${tableName}.code AND data_source.type = '${dataSourceType}'
  `);
};

const removeDataSourceIdColumn = async (db, tableName) =>
  db.removeColumn(tableName, 'data_source_id');

exports.up = async function (db) {
  await addDataSourceIdColumn(db, 'question', 'dataElement');
  await addDataSourceIdColumn(db, 'survey', 'dataGroup');

  await db.runSql(`
    ALTER TABLE survey ALTER COLUMN data_source_id SET NOT NULL;
  `);
};

exports.down = async function (db) {
  await removeDataSourceIdColumn('survey');
  await removeDataSourceIdColumn('question');
};

exports._meta = {
  version: 1,
};
