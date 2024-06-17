'use strict';

var dbm;
var type;
var seed;

const createDataSourceFK = (columnName, table) => ({
  name: `task_${columnName}_fk`,
  table,
  mapping: 'id',
  rules: {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  },
});

const createStatusEnum = db => {
  return db.runSql(`
    CREATE TYPE TASK_STATUS AS ENUM('to_do', 'completed', 'overdue', 'cancelled');
 
  `);
};

const createTaskTable = db => {
  return db.createTable('task', {
    columns: {
      id: { type: 'text', primaryKey: true },
      survey_id: {
        type: 'text',
        notNull: true,
        foreignKey: createDataSourceFK('survey_id', 'survey'),
      },
      entity_id: {
        type: 'text',
        notNull: true,
        foreignKey: createDataSourceFK('entity_id', 'entity'),
      },
      assignee_id: {
        type: 'text',
        notNull: true,
        foreignKey: createDataSourceFK('assignee_id', 'user_account'),
      },
      is_recurring: { type: 'boolean', notNull: true, defaultValue: false },
      repeat_frequency: { type: 'jsonb', notNull: true, defaultValue: '{}' },
      due_date: { type: 'timestamp', notNull: true },
      status: { type: 'TASK_STATUS', notNull: true, defaultValue: 'to_do' },
    },
    ifNotExists: true,
  });
};

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
  await createStatusEnum(db);
  return createTaskTable(db);
};

exports.down = function (db) {
  return db.dropTable('task');
};

exports._meta = {
  version: 1,
};
