'use strict';

import { generateId, insertObject } from '../utilities';

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

const indicators = [
  {
    code: 'COVIDAU_DELTA_ACTIVE_CASES',
    builder: 'arithmetic',
    config: {
      formula: 'dailysurvey003 - dailysurvey005',
      aggregation: {
        dailysurvey003: 'FINAL_EACH_DAY',
        dailysurvey005: 'FINAL_EACH_DAY',
      },
      defaultValues: {
        dailysurvey003: 0,
        dailysurvey005: 0,
      },
    },
  },
];

const insertIndicator = async (db, indicator) => {
  const { code } = indicator;

  await insertObject(db, 'data_source', {
    id: generateId(),
    code,
    type: 'dataElement',
    service_type: 'indicator',
  });
  await insertObject(db, 'indicator', { id: generateId(), ...indicator });
};

const deleteIndicator = async (db, indicator) => {
  const { code } = indicator;
  await db.runSql(
    `DELETE FROM data_source WHERE code = '${code}';
    DELETE FROM indicator WHERE code = '${code}';
  `,
  );
};

const processIndicators = async (db, callback) =>
  Promise.all(indicators.map(async indicator => callback(db, indicator)));

exports.up = async function(db) {
  await processIndicators(db, insertIndicator);
};

exports.down = async function(db) {
  await processIndicators(db, deleteIndicator);
};

exports._meta = {
  version: 1,
};
