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
  await db.addColumn('task', 'survey_response_id', {
    type: 'text',
    foreignKey: {
      name: 'task_survey_response_id_fk',
      table: 'survey_response',
      mapping: 'id',
      // Don't cascade delete, as we want to keep the task even if the survey response is deleted, just set as null
      rules: {
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },
    },
    ifNotExists: true,
  });
  return db.runSql(` 
    CREATE INDEX task_survey_response_id_idx ON task USING btree (survey_response_id); 
  `);
};

exports.down = function (db) {
  return db.removeColumn('task', 'survey_response_id');
};

exports._meta = {
  version: 1,
};
