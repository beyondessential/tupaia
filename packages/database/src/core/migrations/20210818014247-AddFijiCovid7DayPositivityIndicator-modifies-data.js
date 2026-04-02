'use strict';

import {
  insertObject,
  generateId,
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

const INDICATOR_1 = {
  code: 'COVID_FJ_7_Day_Rolling_Pos_Tests',
  builder: 'analyticArithmetic',
  config: {
    formula: new Array(7)
      .fill(0)
      .map((_, i) => `PositiveTests${i + 1}Day${i === 0 ? '' : 's'}Ago`)
      .join(' + '),
    parameters: new Array(7).fill(0).map((_, i) => ({
      // Note: from 0 to 6 days ago
      code: `PositiveTests${i + 1}Day${i === 0 ? '' : 's'}Ago`,
      config: {
        formula: 'COVIDTest_FJPosTest',
        aggregation: [
          'FINAL_EACH_DAY',
          {
            type: 'OFFSET_PERIOD',
            config: {
              offset: i + 1,
              periodType: 'day',
            },
          },
        ],
      },
      builder: 'analyticArithmetic',
    })),
    aggregation: 'FINAL_EACH_DAY',
    defaultValues: new Array(7)
      .fill(0)
      .map((_, i) => `PositiveTests${i + 1}Day${i === 0 ? '' : 's'}Ago`)
      .reduce((acc, code) => ({ ...acc, [code]: 0 }), {}),
  },
};

const INDICATOR_2 = {
  code: 'COVID_FJ_7_Day_Rolling_Num_Tests',
  builder: 'analyticArithmetic',
  config: {
    formula: new Array(7)
      .fill(0)
      .map((_, i) => `NumTests${i + 1}Day${i === 0 ? '' : 's'}Ago`)
      .join(' + '),
    parameters: new Array(7).fill(0).map((_, i) => ({
      // Note: from 0 to 6 days ago
      code: `NumTests${i + 1}Day${i === 0 ? '' : 's'}Ago`,
      config: {
        formula: 'COVIDTest_FJNumTest',
        aggregation: [
          'FINAL_EACH_DAY',
          {
            type: 'OFFSET_PERIOD',
            config: {
              offset: i + 1,
              periodType: 'day',
            },
          },
        ],
      },
      builder: 'analyticArithmetic',
    })),
    aggregation: 'FINAL_EACH_DAY',
    defaultValues: new Array(7)
      .fill(0)
      .map((_, i) => `NumTests${i + 1}Day${i === 0 ? '' : 's'}Ago`)
      .reduce((acc, code) => ({ ...acc, [code]: 0 }), {}),
  },
};

exports.up = async function (db) {
  // const indicator = generateIndicator();
  await insertObject(db, 'indicator', { ...INDICATOR_1, id: generateId() });
  await insertObject(db, 'data_source', {
    id: generateId(),
    code: INDICATOR_1.code,
    type: 'dataElement',
    service_type: 'indicator',
  });

  await insertObject(db, 'indicator', { ...INDICATOR_2, id: generateId() });
  await insertObject(db, 'data_source', {
    id: generateId(),
    code: INDICATOR_2.code,
    type: 'dataElement',
    service_type: 'indicator',
  });
};

exports.down = async function (db) {
  await deleteObject(db, 'indicator', { code: INDICATOR_1.code });
  await deleteObject(db, 'data_source', { code: INDICATOR_1.code });

  await deleteObject(db, 'indicator', { code: INDICATOR_2.code });
  await deleteObject(db, 'data_source', { code: INDICATOR_2.code });
};

exports._meta = {
  version: 1,
};
