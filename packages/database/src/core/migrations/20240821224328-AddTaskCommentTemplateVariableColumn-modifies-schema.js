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
  // Add a new column to the task_comment_template table
  await db.addColumn('task_comment', 'template_variables', {
    type: 'jsonb',
    notNull: true,
    defaultValue: '{}',
  });

  // Allow null values for message
  return db.runSql(`
    ALTER TABLE task_comment 
    ALTER COLUMN message DROP NOT NULL;
  `);
};

exports.down = function (db) {
  return db.removeColumn('task_comment', 'template_variables');
};

exports._meta = {
  version: 1,
};
