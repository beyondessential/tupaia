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

exports.up = function (db) {
  return db.runSql(`
    UPDATE dhis_sync_log
    SET data = REPLACE(data, '"dataElement":', '"code":')
    WHERE data IS NOT NULL
    AND (record_type = 'answer' OR record_type = 'survey_response')
    AND dhis_reference IS NULL;
  `);
};

exports.down = function (db) {
  return db.runSql(`
    UPDATE dhis_sync_log
    SET data = REPLACE(data, '"code":', '"dataElement":')
    WHERE data IS NOT NULL
    AND (record_type = 'answer' OR record_type = 'survey_response')
    AND dhis_reference IS NULL;
  `);
};

exports._meta = {
  version: 1,
};
