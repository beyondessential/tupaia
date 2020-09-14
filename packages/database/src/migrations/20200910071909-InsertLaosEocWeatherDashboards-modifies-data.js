'use strict';

import { insertObject } from '../utilities';

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

// Project level + country level dashboard groups added by AddLoasEocProject migration
// This adds the city level dashboard group, and the dashboards

const DASHBOARDS = [
  {
    id: 'LA_Daily_Precip',
    dataBuilder: 'sum',
    dataBuilderConfig: {
      aggregationType: 'SUM',
      dataElementCodes: ['PRECIP'],
      entityAggregation: { dataSourceEntityType: 'city' },
    },
    viewJson: {
      name: 'Daily Rainfall (mm)',
      type: 'view',
      viewType: 'singleValue',
      valueType: 'oneDecimalPlace',
      periodGranularity: 'one_day_at_a_time',
    },
    dataServices: [],
  },
  {
    id: 'LA_Daily_Max_Temp',
    dataBuilder: 'sum',
    dataBuilderConfig: {
      aggregationType: 'SUM',
      dataElementCodes: ['MAX_TEMP'],
      entityAggregation: { dataSourceEntityType: 'city' },
    },
    viewJson: {
      name: 'Daily maximum temperature (°C)',
      type: 'view',
      viewType: 'singleValue',
      valueType: 'oneDecimalPlace',
      periodGranularity: 'one_day_at_a_time',
    },
    dataServices: [],
  },
  {
    id: 'LA_Daily_Min_Temp',
    dataBuilder: 'sum',
    dataBuilderConfig: {
      aggregationType: 'SUM',
      dataElementCodes: ['MIN_TEMP'],
      entityAggregation: { dataSourceEntityType: 'city' },
    },
    viewJson: {
      name: 'Daily minimum temperature (°C)',
      type: 'view',
      viewType: 'singleValue',
      valueType: 'oneDecimalPlace',
      periodGranularity: 'one_day_at_a_time',
    },
    dataServices: [],
  },
];

const DASHBOARD_GROUP = {
  organisationLevel: 'City',
  userGroup: 'Laos EOC User',
  organisationUnitCode: 'LA',
  dashboardReports: `{${DASHBOARDS.map(dashboard => dashboard.id).join(',')}}`,
  name: 'Weather Observations',
  code: 'LAOS_EOC_City_Weather',
  projectCodes: `{laos_eoc}`,
};

exports.up = async function(db) {
  await insertObject(db, 'dashboardGroup', DASHBOARD_GROUP);

  for (const dashboard of DASHBOARDS) {
    await insertObject(db, 'dashboardReport', dashboard);
  }

  return null;
};

exports.down = async function(db) {
  db.runSql(`DELETE FROM "dashboardGroup" WHERE code = '${DASHBOARD_GROUP.code}';`);

  for (const dashboard of DASHBOARDS) {
    db.runSql(`DELETE FROM "dashboardReport" WHERE id = '${dashboard.id}';`);
  }

  return null;
};

exports._meta = {
  version: 1,
};
