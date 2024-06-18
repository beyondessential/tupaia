'use strict';

var dbm;
var type;
var seed;

const createFK = (columnName, table, shouldCascade) => {
  const rules = shouldCascade
    ? {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }
    : {};
  return {
    name: `task_${columnName}_fk`,
    table,
    mapping: 'id',
    rules,
  };
};

const createStatusEnum = db => {
  return db.runSql(`
    DROP TYPE IF EXISTS TASK_STATUS;
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
        foreignKey: createFK('survey_id', 'survey', true),
      },
      entity_id: {
        type: 'text',
        notNull: true,
        foreignKey: createFK('entity_id', 'entity', true),
      },
      assignee_id: {
        type: 'text',
        foreignKey: createFK('assignee_id', 'user_account', false),
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

exports.down = async function (db) {
  await db.dropTable('task');
  return db.runSql('DROP TYPE TASK_STATUS;');
};

exports._meta = {
  version: 1,
};
