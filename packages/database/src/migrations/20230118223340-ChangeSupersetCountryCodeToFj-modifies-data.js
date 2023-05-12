'use strict';

import { updateValues } from '../utilities';

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

const TABLE_NAME = 'data_element_data_service';
const CURRENT_COUNTRY_CODE = 'FW';
const NEW_COUNTRY_CODE = 'FJ';

exports.up = async function (db) {
  return updateValues(
    db,
    TABLE_NAME,
    { country_code: NEW_COUNTRY_CODE },
    { country_code: CURRENT_COUNTRY_CODE },
  );
};

exports.down = async function (db) {
  return updateValues(
    db,
    TABLE_NAME,
    { country_code: CURRENT_COUNTRY_CODE },
    { country_code: NEW_COUNTRY_CODE },
  );
};

exports._meta = {
  version: 1,
};
