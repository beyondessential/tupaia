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
  await db.runSql(
    `DROP TRIGGER IF EXISTS data_service_sync_group_trigger ON data_service_sync_group`,
  );

  // Add new code column which should match current syncGroupCode
  await db.runSql(`ALTER TABLE data_service_sync_group ADD COLUMN data_group_code text`);

  await db.runSql(`
    UPDATE data_service_sync_group 
    SET 
      data_group_code = trim(both '"' from config->>'internalSurveyCode'),
      code = trim(both '"' from config->>'internalSurveyCode'),
      config = config - 'internalSurveyCode'
  `);
  // Overwriting old code to match data_group_code as a new convention (saves needing to have a made up code)
  // not mandatory however, and can be changed to something else if wished

  // Make data_group_code NOT NULL
  await db.runSql(`ALTER TABLE data_service_sync_group ALTER COLUMN data_group_code SET NOT NULL`);
};

exports.down = async function (db) {
  await db.runSql(`
    UPDATE data_service_sync_group 
    SET 
      config = config || jsonb_build_object('internalSurveyCode', data_group_code)
  `);
  await db.runSql(`ALTER TABLE data_service_sync_group DROP COLUMN data_group_code`);
};

exports._meta = {
  version: 1,
};
