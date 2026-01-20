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

const oldConfig = {
  formula: 'PSSS_Sites_Reported',
  aggregation: 'FINAL_EACH_WEEK',
};

const newConfig = {
  formula: `firstExistingValue(PSSS_Sites_Reported, PSSS_Site_Weekly_Survey_Completed, PSSS_Site_Daily_Survey_Completed)`,
  aggregation: {
    PSSS_Sites_Reported: 'FINAL_EACH_WEEK',
    PSSS_Site_Weekly_Survey_Completed: [
      'FINAL_EACH_WEEK',
      {
        type: 'SUM_PER_PERIOD_PER_ORG_GROUP',
        config: { dataSourceEntityType: 'facility', aggregationEntityType: 'country' },
      },
    ],
    PSSS_Site_Daily_Survey_Completed: [
      'FINAL_EACH_WEEK',
      {
        type: 'SUM_PER_PERIOD_PER_ORG_GROUP',
        config: { dataSourceEntityType: 'facility', aggregationEntityType: 'country' },
      },
    ],
  },
  defaultValues: {
    PSSS_Sites_Reported: 'undefined',
    PSSS_Site_Weekly_Survey_Completed: 'undefined',
    PSSS_Site_Daily_Survey_Completed: 'undefined',
  },
};

const PSSS_SITE_REPORTED_WEEKLY = {
  code: 'PSSS_Site_Weekly_Survey_Completed',
  builder: 'eventCheckConditions',
  config: {
    formula: 'true',
    programCode: 'PSSS_WSR',
  },
};

const PSSS_SITE_REPORTED_DAILY = {
  code: 'PSSS_Site_Daily_Survey_Completed',
  builder: 'eventCheckConditions',
  config: {
    formula: 'true',
    programCode: 'PSSS_DSR',
  },
};

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

const updateIndicator = async (db, code, config) => {
  return db.runSql(`
    UPDATE
      "indicator"
    SET
      "config" = '${JSON.stringify(config)}'
    WHERE
    "code" = '${code}';
  `);
};

exports.up = async function (db) {
  await insertIndicator(db, PSSS_SITE_REPORTED_WEEKLY);
  await insertIndicator(db, PSSS_SITE_REPORTED_DAILY);
  await updateIndicator(db, 'PSSS_Total_Sites_Reported', newConfig);
};

exports.down = async function (db) {
  await updateIndicator(db, 'PSSS_Total_Sites_Reported', oldConfig);
  await deleteIndicator(db, PSSS_SITE_REPORTED_DAILY);
  await deleteIndicator(db, PSSS_SITE_REPORTED_WEEKLY);
};

exports._meta = {
  version: 1,
};
