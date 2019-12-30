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
    ALTER TABLE survey_response
      ADD CONSTRAINT survey_response_entity_id_fkey FOREIGN KEY (entity_id) REFERENCES entity(id) ON UPDATE CASCADE;
    UPDATE survey_response sr
      SET entity_id = e.id
      FROM  clinic c, entity e
      WHERE sr.clinic_id = c.id AND e.code = c.code;
    ALTER TABLE survey_response
      DROP CONSTRAINT survey_response_clinic_id_fkey;
    ALTER TABLE survey_response
      DROP COLUMN clinic_id;
  `);
};

exports.down = function(db) {
  return db.runSql(`
    ALTER TABLE survey_response
      ADD COLUMN clinic_id TEXT;
    ALTER TABLE survey_response
      ADD CONSTRAINT survey_response_clinic_id_fkey FOREIGN KEY (clinic_id) REFERENCES clinic(id) ON UPDATE CASCADE;
    ALTER TABLE survey_response
      DROP CONSTRAINT survey_response_entity_id_fkey;
    UPDATE survey_response sr
      SET clinic_id = c.id
      FROM  clinic c, entity e
      WHERE sr.entity_id = e.id AND e.code = c.code;
`);
};

exports._meta = {
  version: 1,
};
