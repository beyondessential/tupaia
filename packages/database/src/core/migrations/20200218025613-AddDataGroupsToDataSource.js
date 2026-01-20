'use strict';

import { generateId } from '../utilities/generateId';;

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
  const tongaDataSourceMapping = (
    await db.runSql(`
      SELECT data_element.id AS data_element_id, data_group.id AS data_group_id
      FROM question
      JOIN survey_screen_component ON survey_screen_component.question_id = question.id
      JOIN survey_screen ON survey_screen_component.screen_id = survey_screen.id
      JOIN survey ON survey_screen.survey_id = survey.id
      JOIN data_source AS data_group ON survey.code = data_group.code AND data_group.type = 'dataGroup'
      JOIN data_source AS data_element ON question.code = data_element.code AND data_element.type = 'dataElement'
      WHERE question.type NOT IN ('Instruction', 'SubmissionDate', 'DateOfData', 'PrimaryEntity')
      AND (survey.can_repeat = TRUE OR survey.code IN ('CD3a', 'CD3b', 'SCRF')); -- event based surveys
  `)
  ).rows;
  const rowsToInsert = tongaDataSourceMapping.map(
    ({ data_element_id: dataElementId, data_group_id: dataGroupId }) =>
      `('${generateId()}', '${dataElementId}', '${dataGroupId}')`,
  );
  return db.runSql(`
    INSERT INTO data_element_data_group (id, data_element_id, data_group_id) VALUES
    ${rowsToInsert.join(',\n')};
  `);
};

exports.down = function (db) {
  return db.runSql(`
    TRUNCATE TABLE data_element_data_group;
  `);
};

exports._meta = {
  version: 1,
};
