'use strict';

import { arrayToDbString } from '../utilities';

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

const NON_DATA_ELEMENT_QUESTION_TYPES = ['Instruction', 'PrimaryEntity', 'SubmissionDate'];

const selectMissingDataElements = async db => {
  const { rows } = await db.runSql(`
    SELECT code FROM question
    WHERE
      data_source_id IS NULL AND
      type NOT IN (${arrayToDbString(NON_DATA_ELEMENT_QUESTION_TYPES)})`);

  return rows;
};

const insertMissingDataElements = async db =>
  db.runSql(`
    INSERT INTO data_source
    SELECT generate_object_id(), code, 'dataElement', 'dhis', '{"isDataRegional":true}' FROM question
    WHERE
      data_source_id IS NULL AND
      type NOT IN (${arrayToDbString(NON_DATA_ELEMENT_QUESTION_TYPES)})`);

const insertDataElementsDataGroups = async (db, dataElementCodes) =>
  db.runSql(`
  INSERT INTO data_element_data_group
  SELECT generate_object_id(), de.id, dg.id FROM data_source de
  JOIN question q on q.data_source_id = de.id
  JOIN survey_screen_component ssc ON ssc.question_id = q.id
  JOIN survey_screen ss ON ss.id = ssc.screen_id
  JOIN survey s ON s.id = ss.survey_id
  JOIN data_source dg ON dg.id = s.data_source_id
  WHERE
    de.type = 'dataElement' AND
    de.code IN (${arrayToDbString(dataElementCodes)})`);

const updateQuestionDataSourceIds = async db =>
  db.runSql(`
    UPDATE question
    SET data_source_id = data_source.id
    FROM data_source
    WHERE
      data_source_id IS NULL AND
      data_source.code = question.code AND
      data_source.type = 'dataElement' AND
      question.type NOT IN (${arrayToDbString(NON_DATA_ELEMENT_QUESTION_TYPES)})`);

exports.up = async function (db) {
  const dataElements = await selectMissingDataElements(db);
  await insertMissingDataElements(db);

  await updateQuestionDataSourceIds(db);

  const dataElementCodes = dataElements.map(de => de.code);
  await insertDataElementsDataGroups(db, dataElementCodes);
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
