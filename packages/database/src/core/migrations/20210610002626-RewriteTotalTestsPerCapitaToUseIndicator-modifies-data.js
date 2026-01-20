'use strict';

import { generateId, insertObject } from '../utilities';

var dbm;
var type;
var seed;

const updateDashboard = async (db, dashboardId, dataBuilder, dataBuilderConfig) => {
  await db.runSql(`
    UPDATE legacy_report 
    SET data_builder = '${dataBuilder}'
    where code = '${dashboardId}';
  `);

  await db.runSql(`
    UPDATE legacy_report 
    SET data_builder_config = '${JSON.stringify(dataBuilderConfig)}'
    where code = '${dashboardId}';
  `);
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

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

const DASHBOARD_ID = 'COVID_Tests_Per_Capita';

const DAILY_TESTS_PER_CAPITA_INDICATOR = {
  code: 'COVID_AU_Daily_Tests_Per_Capita',
  builder: 'analyticArithmetic',
  config: {
    formula: 'round((dailysurvey006  * 100000) / AU_POP002)',
    aggregation: {
      dailysurvey006: 'FINAL_EACH_DAY',
      AU_POP002: 'FINAL_EACH_DAY_FILL_EMPTY_DAYS',
    },
  },
};

const DATA_BUILDER_AND_CONFIG = {
  oldConfig: {
    dataBuilder: 'sumPreviousValuesPer100kPerDayByOrgUnit',
    dataBuilderConfig: {
      divisor: 'AU_POP002',
      dataElementCodes: ['dailysurvey006'],
      entityAggregation: {
        dataSourceEntityType: 'district',
      },
    },
  },
  newConfig: {
    dataBuilder: 'sumPreviousValuesPerDayByOrgUnit',
    dataBuilderConfig: {
      aggregations: [
        {
          type: 'FINAL_EACH_DAY',
        },
        {
          type: 'SUM_PREVIOUS_EACH_DAY',
        },
      ],
      dataElementCodes: [DAILY_TESTS_PER_CAPITA_INDICATOR.code],
      entityAggregation: {
        dataSourceEntityType: 'district',
      },
    },
  },
};

exports.up = async function (db) {
  await insertIndicator(db, DAILY_TESTS_PER_CAPITA_INDICATOR);
  await updateDashboard(
    db,
    DASHBOARD_ID,
    DATA_BUILDER_AND_CONFIG.newConfig.dataBuilder,
    DATA_BUILDER_AND_CONFIG.newConfig.dataBuilderConfig,
  );
};

exports.down = async function (db) {
  await db.runSql(`DELETE FROM indicator WHERE code = '${DAILY_TESTS_PER_CAPITA_INDICATOR.code}'`);
  await db.runSql(
    `DELETE FROM data_source WHERE code = '${DAILY_TESTS_PER_CAPITA_INDICATOR.code}'`,
  );

  await updateDashboard(
    db,
    DASHBOARD_ID,
    DATA_BUILDER_AND_CONFIG.oldConfig.dataBuilder,
    DATA_BUILDER_AND_CONFIG.oldConfig.dataBuilderConfig,
  );
};

exports._meta = {
  version: 1,
};
