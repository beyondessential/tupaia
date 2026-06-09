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

const QUESTION_CODE = 'CD3b_014b_C19_9';
const CONFIG = { isDataRegional: false };

exports.up = function (db) {
  const id = generateId();
  return db.runSql(`
    INSERT INTO data_source (id, code, type, service_type, config) VALUES
    ('${id}', '${QUESTION_CODE}', 'dataElement', 'dhis', '${JSON.stringify(CONFIG)}');

    INSERT INTO data_element_data_group (id, data_element_id, data_group_id)
    SELECT '${generateId()}', '${id}', id
    FROM data_source WHERE type = 'dataGroup' AND code = 'CD3b';
  `);
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
