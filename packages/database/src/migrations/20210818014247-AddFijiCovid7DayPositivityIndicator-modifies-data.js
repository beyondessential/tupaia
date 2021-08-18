'use strict';

import {
  insertObject,
  generateId,
  findSingleRecord,
  findSingleRecordBySql,
  deleteObject,
} from '../utilities';

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

const INDICATOR = {
  code: 'COVID_FJ_Num_Tests_By_Sub_District',
  builder: 'analyticArithmetic',
  config: {
    formula: 'COVIDTest_FJNumTest',
    parameters: new Array(7).map(([_, i]) => ({
      // Note: from 0 to 6 days ago
      code: `PositiveTests${i}Day${i === 1 ? '' : 's'}Ago`,
      config: {
        formula: 'COVIDTest_FJPosTest',
        aggregation: [
          'FINAL_EACH_DAY',
          {
            type: 'OFFSET_PERIOD',
            config: {
              offset: i,
              periodType: 'day',
            },
          },
        ],
      },
      builder: 'analyticArithmetic',
    })),
    aggregation: {
      COVIDTest_FJNumTest: {
        type: 'SUM_PER_PERIOD_PER_ORG_GROUP',
        config: {
          dataSourceEntityType: 'facility',
          aggregationEntityType: 'sub_district',
        },
      },
    },
  },
};

exports.up = async function (db) {
  // const indicator = generateIndicator();
  await insertObject(db, 'indicator', { ...INDICATOR, id: generateId() });
  await insertObject(db, 'data_source', {
    id: generateId(),
    code: INDICATOR.code,
    type: 'dataElement',
    service_type: 'indicator',
  });
};

exports.down = async function (db) {
  await deleteObject(db, 'indicator', { code: INDICATOR.code });
  await deleteObject(db, 'data_source', { code: INDICATOR.code });
};

exports._meta = {
  version: 1,
};
