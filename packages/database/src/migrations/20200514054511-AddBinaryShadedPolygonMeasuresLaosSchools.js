'use strict';

import { insertObject, arrayToDbString } from '../utilities';

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
const BASE_OVERLAY = {
  groupName: 'Binary Measures (Province level)',
  userGroup: 'Laos Schools User',
  dataElementCode: 'value',
  displayType: 'shading',
  isDataRegional: true,
  hideFromMenu: false,
  hideFromPopup: false,
  hideFromLegend: false,
  values: [
    { name: '0-20%', color: 'Red', value: '<20' },
    { name: '21-40%', color: 'Orange', value: '20-40' },
    { name: '41-60%', color: 'Yellow', value: '40-60' },
    { name: '61-80%', color: 'Lime', value: '60-80' },
    { name: '80-100%', color: 'Green', value: '>80' },
  ],
  measureBuilder: 'groupData',
  presentationOptions: {
    displayedValueKey: 'originalValue',
    valueType: 'percentage',
    disableRenameLegend: true,
  },
  countryCodes: '{"LA"}',
};

const BASE_CONFIG = {
  groups: {
    '<20': { value: 0.2, operator: '<' },
    '20-40': { value: [0.2, 0.4], operator: 'range' },
    '40-60': { value: [0.4, 0.6], operator: 'range' },
    '60-80': { value: [0.6, 0.8], operator: 'range' },
    '>80': { value: 0.8, operator: '>' },
  },
  aggregationEntityType: 'district',
  measureBuilder: 'composePercentagePerOrgUnit',

  measureBuilderConfig: {
    measureBuilders: {
      numerator: {
        measureBuilder: 'sumLatestPerOrgUnit',
        measureBuilderConfig: {
          aggregationEntityType: 'district',
          dataSourceEntityType: 'school',
          dataElementCodes: ['BCD29_event'],
        },
      },
      denominator: {
        measureBuilder: 'sumLatestPerOrgUnit',
        measureBuilderConfig: {
          aggregationEntityType: 'district',
          dataSourceEntityType: 'school',
          dataElementCodes: ['BCD29_event_always_true'],
        },
      },
    },
  },
};

const OVERLAYS = [
  {
    name: 'Electricity Available',
    id: 'LAOS_SCHOOLS_Electricity_Available_Province',
  },
];

exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = async function(db) {
  await Promise.all(
    OVERLAYS.map((overlay, index) => {
      const { name, id } = overlay;
      return insertObject(db, 'mapOverlay', {
        ...BASE_OVERLAY,
        name,
        id,
        measureBuilderConfig: {
          ...BASE_CONFIG,
        },
        sortOrder: index,
      });
    }),
  );
};

exports.down = function(db) {
  return db.runSql(
    `	
    DELETE FROM "mapOverlay" WHERE "id" in (${arrayToDbString(OVERLAYS.map(o => o.id))});	
  `,
  );
};

exports._meta = {
  version: 1,
};
