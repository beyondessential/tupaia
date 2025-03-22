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
  groupName: '% of schools in province with access to resource',
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
    valueType: 'fractionAndPercentage',
    disableRenameLegend: true,
  },
  countryCodes: '{"LA"}',
};

const OVERLAYS = [
  {
    dataElementCodes: ['SchFF001'],
    name: 'Electricity',
    id: 'Laos_Schools_Electricity_Province',
  },
  {
    dataElementCodes: ['SchFF002'],
    name: 'Internet connection in school',
    id: 'Laos_Schools_Internet_Province',
  },
  {
    dataElementCodes: ['BCD29_event'],
    name: 'Functioning water supply',
    id: 'Laos_Schools_Water_Supply_Province',
  },
  {
    dataElementCodes: ['BCD32_event'],
    name: 'Functioning toilet',
    id: 'Laos_Schools_Toilet_Province',
  },
  {
    dataElementCodes: ['SchFF004'],
    name: 'Hand washing facilities',
    id: 'Laos_Schools_Hand_Washing_Province',
  },
  {
    dataElementCodes: ['SchFF008'],
    name: 'Hard copy learning materials for communities with limited internet and TV access',
    id: 'Laos_Schools_Hard_Copy_Materials_Province',
  },
  {
    dataElementCodes: ['SchFF009'],
    name: 'Cleaning/disinfecting materials and guidance on their use',
    id: 'Laos_Schools_Cleaning_Materials_Province',
  },
  {
    dataElementCodes: ['SchFF009a'],
    name: 'Hygiene kits',
    id: 'Laos_Schools_Hygiene_Kits_Province',
  },
  {
    dataElementCodes: ['SchFF010'],
    name: 'COVID-19 prevention and control training',
    id: 'Laos_Schools_COVID_Training_Province',
  },
  {
    dataElementCodes: ['SchFF011'],
    name: 'Implementing remedial education programmes',
    id: 'Laos_Schools_Remedial_Education_Province',
  },
  {
    dataElementCodes: ['SchFF016'],
    name: 'Psychosocial support',
    id: 'Laos_Schools_Psychosocial_Support_Province',
  },
];

exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = async function (db) {
  await Promise.all(
    OVERLAYS.map((overlay, index) => {
      const { name, id, dataElementCodes } = overlay;
      return insertObject(db, 'mapOverlay', {
        ...BASE_OVERLAY,
        name,
        id,
        sortOrder: index,
        measureBuilderConfig: {
          groups: {
            '<20': { value: 0.2, operator: '<' },
            '20-40': { value: [0.2, 0.4], operator: 'range' },
            '40-60': { value: [0.4, 0.6], operator: 'range' },
            '60-80': { value: [0.6, 0.8], operator: 'range' },
            '>80': { value: 0.8, operator: '>' },
          },
          aggregationEntityType: 'district',
          dataSourceEntityType: 'school',
          entityAggregationType: 'RAW',
          measureBuilder: 'composePercentagePerAncestor',
          measureBuilderConfig: {
            aggregationEntityType: 'district',
            dataSourceEntityType: 'school',
            measureBuilders: {
              numerator: {
                measureBuilder: 'checkConditions',
                measureBuilderConfig: {
                  aggregationEntityType: 'district',
                  dataSourceEntityType: 'school',
                  condition: 'Yes',
                  dataElementCodes,
                },
              },
              denominator: {
                measureBuilder: 'checkConditions',
                measureBuilderConfig: {
                  aggregationEntityType: 'district',
                  dataSourceEntityType: 'school',
                  condition: '*',
                  dataElementCodes: ['SchFFprov'],
                },
              },
            },
          },
        },
      });
    }),
  );
};

exports.down = function (db) {
  return db.runSql(
    `	
    DELETE FROM "mapOverlay" WHERE "id" in (${arrayToDbString(OVERLAYS.map(o => o.id))});	
  `,
  );
};

exports._meta = {
  version: 1,
};
