'use strict';

import { insertObject } from '../utilities';

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */

const RADIUS_OVERLAY = {
  id: 'STRIVE_WTF_mRDT_Tests_Radius',
  name: 'Number of Tests',
  measureBuilderConfig: {
    dataSourceType: 'custom',
    aggregationEntityType: 'facility',
    aggregationType: 'SUM',
  },
  groupName: 'STRIVE PNG: Health Facility Data (Source: WTF)',
  userGroup: 'STRIVE User',
  dataElementCode: 'SSWT1072',
  displayType: 'radius',
  isDataRegional: true,
  hideFromMenu: true,
  hideFromPopup: false,
  hideFromLegend: true,
  values: [
    { color: 'blue', value: 'other' },
    { color: 'grey', value: null },
  ],
  measureBuilder: 'valueForOrgGroup',
  countryCodes: '{"PG"}',
};

const SHOWN_OVERLAY = {
  id: 'STRIVE_WTF_Positive',
  name: '% mRDT Positive (of total # tests performed)',
  groupName: 'STRIVE PNG: Health Facility Data (Source: WTF)',
  userGroup: 'STRIVE User',
  dataElementCode: 'value',
  displayType: 'spectrum',
  isDataRegional: true,
  hideFromMenu: false,
  hideFromPopup: false,
  hideFromLegend: false,
  values: [
    // Shows icon only if there is no data.
    {
      icon: 'hidden',
      color: 'blue',
      value: 'other',
    },
    {
      icon: 'fade',
      color: 'grey',
      value: null,
    },
  ],
  measureBuilder: 'composePercentagePerOrgUnit',
  measureBuilderConfig: {
    measureBuilders: {
      numerator: {
        measureBuilder: 'sumAllPerOrgUnit',
        measureBuilderConfig: {
          dataElementCodes: ['SSWT1021', 'SSWT1022', 'SSWT1023'],
        },
      },
      denominator: {
        measureBuilder: 'sumAllPerOrgUnit',
        measureBuilderConfig: {
          dataElementCodes: ['SSWT1072'],
        },
      },
    },

    dataSourceType: 'custom',
    aggregationEntityType: 'facility',
  },
  countryCodes: '{"PG"}',
  presentationOptions: {
    scaleType: 'performanceDesc',
    valueType: 'percentage',
    scaleMax: 'auto',
  },
  linkedMeasures: '{"STRIVE_WTF_mRDT_Tests_Radius"}',
};

exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = async function (db) {
  await insertObject(db, 'mapOverlay', RADIUS_OVERLAY);
  await insertObject(db, 'mapOverlay', SHOWN_OVERLAY);
};

exports.down = function (db) {
  return db.runSql(
    `	
    DELETE FROM "mapOverlay" WHERE "id" = '${RADIUS_OVERLAY.id}';	
    DELETE FROM "mapOverlay" WHERE "id" = '${SHOWN_OVERLAY.id}';	
  `,
  );
};

exports._meta = {
  version: 1,
};
