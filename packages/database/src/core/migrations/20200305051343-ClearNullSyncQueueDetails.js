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
    UPDATE dhis_sync_queue
    SET details = '{}'
    WHERE is_deleted = false
    AND details IN (
      '{"isDataRegional":null,"organisationUnitCode":null}',
      '{"surveyResponseId":null,"surveyCode":null,"isDataRegional":null,"organisationUnitCode":null}'
    );
  `);
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
