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

const createDataSourceFK = columnName => ({
  name: `data_element_data_group_${columnName}_fk`,
  table: 'data_source',
  rules: {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  },
  mapping: 'id',
});

exports.up = async function (db) {
  return db.createTable('data_element_data_group', {
    columns: {
      id: { type: 'text', primaryKey: true },
      data_element_id: {
        type: 'text',
        notNull: true,
        foreignKey: createDataSourceFK('data_element_id'),
      },
      data_group_id: {
        type: 'text',
        notNull: true,
        foreignKey: createDataSourceFK('data_group_id'),
      },
    },
    ifNotExists: true,
  });
};

exports.down = async function (db) {
  return db.dropTable('data_element_data_group');
};

exports._meta = {
  version: 1,
};
