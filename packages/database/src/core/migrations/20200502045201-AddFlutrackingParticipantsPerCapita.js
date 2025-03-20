'use strict';

import { insertObject } from '../utilities';

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */

const OVERLAY = {
  id: 'AU_FLUTRACKING_Participants_Per_100k',
  name: 'Participants per 100k',
  groupName: 'Flutracking Australia',
  userGroup: 'Public',
  dataElementCode: 'value',
  displayType: 'shaded-spectrum',
  isDataRegional: false,
  sortOrder: 1,
  hideFromMenu: false,
  hideFromPopup: false,
  hideFromLegend: false,
  measureBuilder: 'composePercentagePerOrgUnit',
  measureBuilderConfig: {
    fractionType: 'per100k',
    dataSourceType: 'custom',
    measureBuilders: {
      numerator: {
        measureBuilder: 'sumLatestPerOrgUnit',
        measureBuilderConfig: {
          dataElementCodes: ['FWV_003'],
        },
      },
      denominator: {
        measureBuilder: 'sumLatestPerOrgUnit',
        measureBuilderConfig: {
          dataElementCodes: ['AU_POP002'],
        },
      },
    },
    aggregationEntityType: 'district',
  },
  presentationOptions: {
    scaleMax: 1000,
    scaleMin: 0,
    scaleType: 'performance',
    valueType: 'number',
  },
  countryCodes: '{"AU"}',
};

exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = async function (db) {
  await insertObject(db, 'mapOverlay', OVERLAY);
};

exports.down = function (db) {
  return db.runSql(
    `	
    DELETE FROM "mapOverlay" WHERE "id" = '${OVERLAY.id}';	
  `,
  );
};

exports._meta = {
  version: 1,
};
