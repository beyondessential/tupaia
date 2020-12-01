'use strict';

import { arrayToDbString, generateId, insertObject } from '../utilities';

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

const insertIndicator = async (db, indicator) => {
  await insertObject(db, 'indicator', { ...indicator, id: generateId() });
  await insertObject(db, 'data_source', {
    id: generateId(),
    code: indicator.code,
    type: 'dataElement',
    service_type: 'indicator',
  });
};

exports.up = function (db) {
  return insertIndicator(db, {
    code: 'PSSS_Total_Sites',
    builder: 'arithmetic',
    config: {
      formula: 'PSSS_Sites',
      aggregation: 'FINAL_EACH_WEEK',
    },
  });
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
