'use strict';

import { insertObject, generateId, deleteObject } from '../utilities';

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

const CONFIG = syndromeCode => ({
  formula: `firstExistingValue(PSSS_${syndromeCode}_Daily_Cases)`,
  aggregation: {
    [`PSSS_${syndromeCode}_Daily_Cases`]: ['SUM_EACH_WEEK', 'FINAL_EACH_WEEK'],
  },
  defaultValues: {
    [`PSSS_${syndromeCode}_Daily_Cases`]: 'undefined',
  },
});

const CODE = 'PSSS_CON_Total_Cases';

exports.up = async function (db) {
  await insertObject(db, 'indicator', {
    id: generateId(),
    code: CODE,
    builder: 'analyticArithmetic',
    config: CONFIG('CON'),
  });
  await insertObject(db, 'data_source', {
    id: generateId(),
    code: CODE,
    type: 'dataElement',
    service_type: 'indicator',
  });
};

exports.down = async function (db) {
  await deleteObject(db, 'indicator', { code: CODE });
  await deleteObject(db, 'data_source', { code: CODE });
};

exports._meta = {
  version: 1,
};
