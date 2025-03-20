'use strict';

import { insertObject } from '../utilities';

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

const PSSS_COUNTRIES = [
  'AS',
  'CK',
  'FJ',
  'FM',
  'GU',
  'KI',
  'MH',
  'MP',
  'NC',
  'NR',
  'NU',
  'NZ',
  'PF',
  'PG',
  'PI',
  'PW',
  'SB',
  'TK',
  'TO',
  'TV',
  'VU',
  'WF',
  'WS',
];

const DASHBOARD_GROUP_TEMPLATE = {
  organisationLevel: 'Country',
  userGroup: 'PSSS Tupaia',
  organisationUnitCode: null,
  dashboardReports: '{PSSS_Number_of_Sentinel_Sites}',
  name: 'Syndromic Surveillance',
  code: null,
  projectCodes: '{psss}',
};

const DASHBOARD_REPORT = {
  id: 'PSSS_Number_of_Sentinel_Sites',
  dataBuilder: 'latestDataValue',
  dataBuilderConfig: {
    dataElementCodes: ['PSSS_Confirmed_Sites'],
    entityAggregation: {
      aggregationType: 'MOST_RECENT_PER_ORG_GROUP',
      dataSourceEntityType: 'country',
      aggregationEntityType: 'country',
    },
  },
  viewJson: {
    name: 'Number of Sentinel Sites',
    type: 'view',
    viewType: 'singleValue',
    periodGranularity: 'one_week_at_a_time',
  },
};

exports.up = async function (db) {
  for (const country of PSSS_COUNTRIES) {
    await insertObject(db, 'dashboardGroup', {
      ...DASHBOARD_GROUP_TEMPLATE,
      organisationUnitCode: country,
      code: `${country}_PSSS_Syndromic_Surveillance`,
    });
  }
  await insertObject(db, 'dashboardReport', DASHBOARD_REPORT);
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
