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

  await db.runSql(`ALTER TABLE data_service_sync_group RENAME COLUMN code TO data_group_code`);
  await db.runSql(`
    UPDATE data_service_sync_group 
    SET 
      data_group_code = trim(both '"' from config->>'internalSurveyCode'),
      config = (config || jsonb_build_object('syncGroupCode', data_group_code)) - 'internalSurveyCode'
  `);
  // Note: syncGroupCode doesn't mean anything, because a Sync Group is and extension of a Data Group,
  // but we keep the old value around anyway just in case we will need it in the future
};

exports.down = async function (db) {
  await db.runSql(`
    UPDATE data_service_sync_group 
    SET 
      data_group_code = trim(both '"' from config->>'syncGroupCode'),
      config = (config || jsonb_build_object('internalSurveyCode', data_group_code)) - 'syncGroupCode'
  `);
  await db.runSql(`ALTER TABLE data_service_sync_group RENAME COLUMN data_group_code TO code`);
};

exports._meta = {
  version: 1,
};
