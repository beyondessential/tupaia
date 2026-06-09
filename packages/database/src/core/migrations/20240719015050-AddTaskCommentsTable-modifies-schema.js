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

const createTypeEnum = db => {
  return db.runSql(`
    DROP TYPE IF EXISTS TASK_COMMENT_TYPE;
    CREATE TYPE TASK_COMMENT_TYPE AS ENUM('user', 'system');
 
  `);
};

const createForeignKey = (columnName, table, shouldCascade) => {
  const rule = shouldCascade ? 'CASCADE' : 'SET NULL';
  return {
    name: `task_${columnName}_fk`,
    table,
    mapping: 'id',
    rules: {
      onDelete: rule,
      onUpdate: rule,
    },
  };
};

exports.up = async function (db) {
  await createTypeEnum(db);
  await db.createTable('task_comment', {
    columns: {
      id: { type: 'text', primaryKey: true },
      task_id: {
        type: 'text',
        notNull: true,
        foreignKey: createForeignKey('task_id', 'task', true),
      },
      user_id: {
        type: 'text',
        foreignKey: createForeignKey('user_id', 'user_account', false),
      },
      user_name: { type: 'text', notNull: true },
      message: { type: 'text', notNull: true },
      type: { type: 'TASK_COMMENT_TYPE', notNull: true, defaultValue: 'user' },
      created_at: {
        type: 'timestamp with time zone',
        notNull: true,
      },
    },
    ifNotExists: true,
  });

  return db.runSql(` 
    ALTER TABLE task_comment 
      ALTER COLUMN created_at SET DEFAULT now();
      
    CREATE INDEX task_comment_task_id_idx ON task_comment USING btree (task_id);
    CREATE INDEX task_comment_user_id_idx ON task_comment USING btree (user_id); 
  `);
};

exports.down = async function (db) {
  await db.dropTable('task_comment');
  return db.runSql('DROP TYPE TASK_COMMENT_TYPE;');
};

exports._meta = {
  version: 1,
};
