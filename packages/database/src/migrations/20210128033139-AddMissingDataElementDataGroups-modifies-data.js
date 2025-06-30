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

const insertMissingDataElementDataGroups = async db =>
  db.runSql(`
    INSERT INTO data_element_data_group
    SELECT generate_object_id(), de.id, dg.id FROM data_source de
    JOIN question q on q.data_source_id = de.id
    JOIN survey_screen_component ssc ON ssc.question_id = q.id
    JOIN survey_screen ss ON ss.id = ssc.screen_id
    JOIN survey s ON s.id = ss.survey_id
    JOIN data_source dg ON dg.id = s.data_source_id
    ON CONFLICT DO NOTHING`);

exports.up = async function (db) {
  await insertMissingDataElementDataGroups(db);
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
