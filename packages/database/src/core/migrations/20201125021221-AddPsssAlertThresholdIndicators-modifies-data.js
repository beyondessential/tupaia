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

const CONDITION_CODES = ['AFR', 'DIA', 'ILI', 'PF', 'DLI'];

// eg 'PSSS_Confirmed_AFR_Site_Average'
const psssCode = (descriptor, condition = '', isConfirmed = false) => {
  const parts = ['PSSS', descriptor];
  if (condition) {
    parts.splice(1, 0, condition);
  }
  if (isConfirmed) {
    parts.splice(1, 0, 'Confirmed');
  }

  return parts.join('_');
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

const createAlertThresholdLevelIndicator = async (db, condition, isConfirmed) => {
  if (condition === 'AFR') {
    // The threshold level for AFR is always 1
    return true;
  }

  const createParameter = (code, offset) => ({
    code,
    builder: 'arithmetic',
    config: {
      formula: psssCode('Site_Average', condition, isConfirmed),
      aggregation: [
        'FINAL_EACH_WEEK',
        { type: 'OFFSET_PERIOD', config: { periodType: 'week', offset } },
      ],
    },
  });

  let averageFormula = `(siteAverage1WeekAgo + siteAverage2WeeksAgo) / 2`;
  const parameters = [
    createParameter('siteAverage1WeekAgo', 1),
    createParameter('siteAverage2WeeksAgo', 2),
  ];

  if (condition === 'DLI') {
    averageFormula = '(siteAverage1WeekAgo + siteAverage2WeeksAgo + siteAverage3WeeksAgo) / 3';
    parameters.push(createParameter('siteAverage3WeeksAgo', 3));
  }

  return insertIndicator(db, {
    code: psssCode('Alert_Threshold_Level', condition, isConfirmed),
    builder: 'arithmetic',
    config: {
      formula: `2 * (${averageFormula})`,
      aggregation: 'FINAL_EACH_WEEK',
      parameters,
    },
  });
};

const createAlertThresholdCrossedIndicator = async (db, condition, isConfirmed) => {
  const siteAverage = psssCode('Site_Average', condition, isConfirmed);
  const thresholdLevel =
    condition === 'AFR' ? '1' : psssCode('Alert_Threshold_Level', condition, isConfirmed);

  return insertIndicator(db, {
    code: psssCode('Alert_Threshold_Crossed', condition, isConfirmed),
    builder: 'arithmetic',
    config: {
      formula: `${siteAverage} > ${thresholdLevel}`,
      aggregation: 'FINAL_EACH_WEEK',
    },
  });
};

exports.up = async function (db) {
  await Promise.all(
    CONDITION_CODES.map(async condition => {
      await createAlertThresholdLevelIndicator(db, condition, true);
      await createAlertThresholdLevelIndicator(db, condition, false);

      await createAlertThresholdCrossedIndicator(db, condition, true);
      await createAlertThresholdCrossedIndicator(db, condition, false);
    }),
  );
};

exports.down = async function (db) {
  const codes = CONDITION_CODES.flatMap(condition => [
    psssCode('Alert_Threshold_Level', condition, true),
    psssCode('Alert_Threshold_Level', condition, false),
    psssCode('Alert_Threshold_Crossed', condition, true),
    psssCode('Alert_Threshold_Crossed', condition, false),
  ]);

  await db.runSql(`DELETE FROM indicator WHERE code IN (${arrayToDbString(codes)})`);
  await db.runSql(`DELETE FROM data_source WHERE code IN (${arrayToDbString(codes)})`);
};

exports._meta = {
  version: 1,
};
