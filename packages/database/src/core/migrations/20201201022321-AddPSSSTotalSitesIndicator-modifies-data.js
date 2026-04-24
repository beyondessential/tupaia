'use strict';

import { generateId, insertObject } from '../utilities';

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

const SITES_DATA_CODE = 'PSSS_Sites';
const TOTAL_SITES_INDICATOR_CODE = 'PSSS_Total_Sites';

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
    code: TOTAL_SITES_INDICATOR_CODE,
    builder: 'arithmetic',
    config: {
      formula: SITES_DATA_CODE,
      aggregation: 'FINAL_EACH_WEEK',
    },
  });
};

exports.down = async function (db) {
  await db.runSql(`DELETE FROM indicator WHERE code = '${TOTAL_SITES_INDICATOR_CODE}'`);
  await db.runSql(`DELETE FROM data_source WHERE code = '${TOTAL_SITES_INDICATOR_CODE}'`);
};

exports._meta = {
  version: 1,
};
