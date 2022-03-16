'use strict';

import DATA_ELEMENT_CODES from './migrationData/20220221232146-AddDataElementFromDataLakeToTupaia-modifies-data/DataElementCodes - DataLake.json';
import { generateId } from '../utilities/generateId';

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
  const formattedValues = DATA_ELEMENT_CODES.dataElementCodes
    .map(code => `('${generateId()}', '${code}','dataElement','data-lake')`)
    .join(',');
  return db.runSql(`
    INSERT INTO data_source (id, code, type, service_type)
    VALUES
    ${formattedValues}
  `);
};

exports.down = async function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
