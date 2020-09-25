'use strict';

import { generateId } from '../utilities';

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

exports.up = async function(db) {
  for (const code of ['PRECIP', 'MAX_TEMP', 'MIN_TEMP']) {
    await db.runSql(
      `INSERT INTO data_source (id, code, type, service_type, config) VALUES ('${generateId()}', '${code}', 'dataElement', 'weather', '{}');`,
    );
  }

  return null;
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
