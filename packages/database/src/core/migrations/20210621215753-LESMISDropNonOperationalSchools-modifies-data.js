'use strict';

import { SCHOOL_CODES } from './migrationData/20210621215753-LESMISDropNonOperationalSchools';

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
  await db.runSql(`
    -- Survey responses have a foreign key constraint on entities
    -- So delete them first
    DELETE FROM survey_response
    WHERE id IN (
      SELECT survey_response.id from survey_response
      INNER JOIN entity
      ON entity.id = survey_response.entity_id
      WHERE entity.code IN ('${SCHOOL_CODES.join("','")}')
    );

    DELETE FROM entity
    WHERE code IN ('${SCHOOL_CODES.join("','")}');
  `);
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
