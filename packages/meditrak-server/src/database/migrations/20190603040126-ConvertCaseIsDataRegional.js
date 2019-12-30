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
  return db.runSql(`
    DROP TRIGGER IF EXISTS survey_trigger
      ON survey; -- Drop trigger as some image payloads are too large
    UPDATE survey
      SET integration_metadata =
        jsonb_set(integration_metadata, '{dhis2,isDataRegional}', integration_metadata->'dhis2'->'is_data_regional')
        #- '{dhis2,is_data_regional}' -- Deep delete old 'is_data_regional' key
      WHERE integration_metadata ? 'dhis2';
    CREATE TRIGGER survey_trigger
      AFTER INSERT OR UPDATE or DELETE
      ON survey
      FOR EACH ROW EXECUTE PROCEDURE notification(); -- Recreate trigger
  `);
};

exports.down = function(db) {
  return db.runSql(`
    DROP TRIGGER IF EXISTS survey_trigger
      ON survey; -- Drop trigger as some image payloads are too large
    UPDATE survey
      SET integration_metadata =
        jsonb_set(integration_metadata, '{dhis2,is_data_regional}', integration_metadata->'dhis2'->'isDataRegional')
        #- '{dhis2,isDataRegional}' -- Deep delete new 'isDataRegional' key
      WHERE integration_metadata ? 'dhis2';
    CREATE TRIGGER survey_trigger
      AFTER INSERT OR UPDATE or DELETE
      ON survey
      FOR EACH ROW EXECUTE PROCEDURE notification(); -- Recreate trigger
  `);
};

exports._meta = {
  version: 1,
};
