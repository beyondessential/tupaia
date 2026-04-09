'use strict';

import { insertObject, generateId } from '../utilities';

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
  return insertObject(db, 'data_table', {
    id: generateId(),
    code: 'survey_responses',
    description: 'Fetches data for survey responses',
    type: 'survey_responses',
    permission_groups: '{*}',
  });
};

exports.down = async function (db) {
  return db.runSql(`
    DELETE FROM data_table
    WHERE code = 'survey_responses'
  `);
};

exports._meta = {
  version: 1,
};
