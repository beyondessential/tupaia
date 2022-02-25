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
    UPDATE entity
    SET metadata = '{"dhis":{"isDataRegional":false}}'
    WHERE id IN (
      SELECT entity.id FROM entity
      JOIN survey_response ON entity.id = survey_response.entity_id
      JOIN survey ON survey.id = survey_response.survey_id
      WHERE survey.code IN ('CCRF', 'CCLF', 'CCFU');
    )
  `);
};

exports.down = function (db) {
  return null; // destructive up migration, so can't write a down
};

exports._meta = {
  version: 1,
};
