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
    CREATE TYPE TASK_STATUS AS ENUM('to_do', 'cancelled', 'completed', 'overdue','repeating');
 
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
      // add the assignee name so that we can easily filter tasks by assignee name
      assignee_name: { type: 'text' },
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
  await createTaskTable(db);

  return db.runSql(` 
    CREATE INDEX task_survey_id_idx ON task USING btree (survey_id);
    CREATE INDEX task_entity_id_idx ON task USING btree (entity_id);
    CREATE INDEX task_assignee_id_idx ON task USING btree (assignee_id);
  `);
};

exports.down = async function (db) {
  await db.dropTable('task');
  return db.runSql('DROP TYPE TASK_STATUS;');
};

exports._meta = {
  version: 1,
};
