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

const insertMissingDataElements = async db =>
  db.runSql(`
    INSERT INTO data_source
    SELECT generate_object_id(), code, 'dataElement', 'dhis', '{"isDataRegional":true}' FROM question
    WHERE
      data_source_id IS NULL AND
      type NOT IN (${arrayToDbString(NON_DATA_ELEMENT_QUESTION_TYPES)})`);

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
  await insertMissingDataElements(db);
  await updateQuestionDataSourceIds(db);
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
