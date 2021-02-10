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

exports.up = async function (db) {
  await db.runSql(`ALTER TABLE survey ALTER COLUMN data_source_id SET NOT NULL;`);
  await db.runSql(
    `ALTER TABLE question
    ADD CONSTRAINT data_source_id_not_null_on_conditions
    CHECK(
      type IN (${arrayToDbString(NON_DATA_ELEMENT_QUESTION_TYPES)}) OR
      (data_source_id IS NOT NULL)
    )`,
  );
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
