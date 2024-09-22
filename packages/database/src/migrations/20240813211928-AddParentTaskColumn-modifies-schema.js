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
  await db.addColumn('task', 'parent_task_id', {
    type: 'text',
    foreignKey: {
      name: 'task_parent_task_id_fk',
      table: 'task',
      mapping: 'id',
      // Don't cascade delete, as we want to keep the task even if the parent task is deleted, just set as null
      rules: {
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },
    },
    ifNotExists: true,
  });
  return db.runSql(` 
    CREATE INDEX IF NOT EXISTS task_parent_task_id_fk ON task USING btree (parent_task_id); 
  `);
};

exports.down = function (db) {
  return db.removeColumn('task', 'parent_task_id', {
    ifExists: true,
  });
};

exports._meta = {
  version: 1,
};
