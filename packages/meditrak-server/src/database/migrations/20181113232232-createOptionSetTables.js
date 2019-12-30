'use strict';

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function(db) {
  // add optionset table
  db.createTable('option_set', {
    columns: {
      id: { type: 'text', primaryKey: true },
      name: { type: 'text', notNull: true },
    },
    ifNotExists: true,
  });
  // add option table
  db.createTable('option', {
    columns: {
      id: { type: 'text', primaryKey: true },
      value: { type: 'text', notNull: true },
      label: { type: 'text' },
      sort_order: { type: 'int' },
      option_set_id: {
        type: 'text',
        notNull: true,
        foreignKey: {
          name: 'option_option_set_id_fk',
          table: 'option_set',
          rules: {
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
          },
          mapping: 'id',
        },
      },
    },
    ifNotExists: true,
  });
  // add optionsetid column to question
  return db.addColumn('question', 'option_set_id', {
    type: 'string',
    foreignKey: {
      name: 'question_option_set_id_fk',
      table: 'option_set',
      rules: {
        onDelete: 'RESTRICT',
        onUpdate: 'RESTRICT',
      },
      mapping: 'id',
    },
  });
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
