'use strict';

import { insertObject, arrayToDbString } from '../utilities';

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */

const PROVINCE_GROUP_NAME = 'School Indicators by Province';
const DISTRICT_GROUP_NAME = 'School Indicators by District';

const OLD_GROUP_NAME = 'Percentage of School Utility/Resource Availability by province';

const BASE_OVERLAY = {
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
    { name: '81-100%', color: 'Green', value: '>80' },
  ],
  measureBuilder: 'groupData',
  countryCodes: '{"LA"}',
  projectCodes: '{"laos_schools"}',
};

const BASE_PRESENTATION_OPTIONS = {
  displayedValueKey: 'originalValue',
  valueType: 'fractionAndPercentage',
  disableRenameLegend: true,
};

const OLD_OVERLAY_IDS = [
  'Laos_Schools_Electricity_Province',
  'Laos_Schools_Internet_Province',
  'Laos_Schools_Water_Supply_Province',
  'Laos_Schools_Toilet_Province',
  'Laos_Schools_Hand_Washing_Province',
  'Laos_Schools_Hard_Copy_Materials_Province',
  'Laos_Schools_Cleaning_Materials_Province',
  'Laos_Schools_Hygiene_Kits_Province',
  'Laos_Schools_COVID_Training_Province',
  'Laos_Schools_Remedial_Education_Province',
  'Laos_Schools_Psychosocial_Support_Province',
];

const NEW_OVERLAYS = [
  {
    dataElementCodes: ['SchFF001'],
    name: 'Electricity available', // Changed
    baseId: 'Laos_Schools_Electricity',
  },
  {
    dataElementCodes: ['SchFF002'],
    name: 'Internet connection available', // Changed
    baseId: 'Laos_Schools_Internet',
  },
  {
    dataElementCodes: ['BCD29_event'],
    name: 'Access to clean water', // Changed
    baseId: 'Laos_Schools_Water_Supply',
  },
  {
    dataElementCodes: ['BCD32_event'],
    name: 'Functioning toilets', // Changed
    baseId: 'Laos_Schools_Toilet',
  },
  {
    dataElementCodes: ['SchFF004'],
    name: 'Functioning hand washing facilities', // Changed
    baseId: 'Laos_Schools_Hand_Washing',
  },
  // {
  //   dataElementCodes: ['SchFF008'],
  //   name: 'Hard copy learning materials for communities with limited internet and TV access',
  //   baseId: 'Laos_Schools_Hard_Copy_Materials',
  // },
  // {
  //   dataElementCodes: ['SchFF009'],
  //   name: 'Cleaning/disinfecting materials and guidance on their use',
  //   baseId: 'Laos_Schools_Cleaning_Materials',
  // },
  // {
  //   dataElementCodes: ['SchFF009a'],
  //   name: 'Hygiene kits',
  //   baseId: 'Laos_Schools_Hygiene_Kits',
  // },
  // {
  //   dataElementCodes: ['SchFF010'],
  //   name: 'COVID-19 prevention and control training',
  //   baseId: 'Laos_Schools_COVID_Training',
  // },
  {
    dataElementCodes: ['SchFF011'],
    name: 'Remedial support provided to students', // Changed
    baseId: 'Laos_Schools_Remedial_Education',
  },
  // {
  //   dataElementCodes: ['SchFF016'],
  //   name: 'Psychosocial support',
  //   baseId: 'Laos_Schools_Psychosocial_Support',
  // },

  // New
  {
    name: 'Textbooks and additional learning material received',
    baseId: 'Laos_Schools_Textbooks_And_Additional_Learning_Materials',
    dataElementCodes: ['SchCVD004'],
  },
  {
    name: 'Students have their own textbooks',
    baseId: 'Laos_Schools_Students_Have_Own_Textbooks',
    dataElementCodes: ['SchCVD005'],
  },
  {
    name: 'COVID-19 posters and materials received',
    baseId: 'Laos_Schools_Covid_Posters_And_Materials',
    dataElementCodes: ['SchCVD006'],
  },
  {
    name: 'Thermometer(s) received for taking temperature',
    baseId: 'Laos_Schools_Thermometer',
    dataElementCodes: ['SchCVD024'],
  },
  {
    name: 'Hygiene promotion training in last 3 years',
    baseId: 'Laos_Schools_Hygiene_Training_Within_3_Years',
    dataElementCodes: ['SchCVD007'],
  },
  {
    name: 'Functioning TV, satellite receiver and dish set',
    baseId: 'Laos_Schools_TV_Sat_Receiver_And_Dish',
    dataElementCodes: ['SchCVD012'],
  },
  {
    name: 'Functioning notebook/laptop or desktop computer',
    baseId: 'Laos_Schools_Functioning_Computer',
    dataElementCodes: ['SchCVD013'],
  },
  {
    name: 'Functioning projector',
    baseId: 'Laos_Schools_Functioning_Projector',
    dataElementCodes: ['SchCVD015'],
  },
  {
    name: 'Teachers follow the MoES education shows on TV',
    baseId: 'Laos_Schools_Teachers_Follow_MoES_On_TV',
    dataElementCodes: ['SchCVD016'],
  },
  {
    name: 'Students follow the MoES education shows on TV',
    baseId: 'Laos_Schools_Students_Follow_MoES_On_TV',
    dataElementCodes: ['SchCVD017'],
  },
  {
    name: 'Teachers using resources on MoES website',
    baseId: 'Laos_Schools_Teachers_Use_MoES_Website',
    dataElementCodes: ['SchCVD018'],
  },
  {
    name: 'Training on digital literacy and MoES website resources received',
    baseId: 'Laos_Schools_Digital_And_MoES_Training',
    dataElementCodes: ['SchCVD019'],
  },
  {
    name: 'Support implementing catch-up/remedial teaching programmes received',
    baseId: 'Laos_Schools_Remedial_Teaching_Support',
    dataElementCodes: ['SchCVD020'],
  },
  {
    name: 'Students require psychosocial support',
    baseId: 'Laos_Schools_Psychosocial_Support_Required',
    dataElementCodes: ['SchCVD021'],
  },
];

exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = async function (db) {
  // First delete old overlays
  await db.runSql(`	
    DELETE FROM "mapOverlay" WHERE "id" in (${arrayToDbString(OLD_OVERLAY_IDS)});	
  `);

  // Then create the new ones
  await Promise.all(
    [true, false].map(isProvinceLevel =>
      Promise.all(
        // Overlays is mapped through twice, once for isProvinceLevel = true
        // and again for isProvinceLevel = false
        NEW_OVERLAYS.map((overlay, index) => {
          const { name, baseId, dataElementCodes } = overlay;
          const id = `${baseId}${isProvinceLevel ? '_Province' : '_District'}`;
          return insertObject(db, 'mapOverlay', {
            ...BASE_OVERLAY,
            groupName: isProvinceLevel ? PROVINCE_GROUP_NAME : DISTRICT_GROUP_NAME,
            name,
            id,
            sortOrder: index,
            presentationOptions: {
              ...BASE_PRESENTATION_OPTIONS,
              measureLevel: isProvinceLevel ? 'District' : 'SubDistrict',
            },
            measureBuilderConfig: {
              groups: {
                '<20': { value: 0.2, operator: '<' },
                '20-40': { value: [0.2, 0.4], operator: 'range' },
                '40-60': { value: [0.4, 0.6], operator: 'range' },
                '60-80': { value: [0.6, 0.8], operator: 'range' },
                '>80': { value: 0.8, operator: '>' },
              },
              measureBuilder: 'composePercentagePerOrgUnit',
              measureBuilderConfig: {
                measureBuilders: {
                  numerator: {
                    measureBuilder: 'sumLatestPerOrgUnit',
                    measureBuilderConfig: {
                      entityAggregation: {
                        aggregationEntityType: isProvinceLevel ? 'district' : 'sub_district',
                        dataSourceEntityType: 'school',
                        aggregationType: 'SUM_PER_ORG_GROUP',
                        aggregationConfig: {
                          valueToMatch: 'Yes',
                        },
                      },
                      dataElementCodes,
                    },
                  },
                  denominator: {
                    measureBuilder: 'sumLatestPerOrgUnit',
                    measureBuilderConfig: {
                      entityAggregation: {
                        aggregationEntityType: isProvinceLevel ? 'district' : 'sub_district',
                        dataSourceEntityType: 'school',
                        aggregationType: 'SUM_PER_ORG_GROUP',
                        aggregationConfig: {
                          valueToMatch: '*',
                        },
                      },
                      dataElementCodes,
                    },
                  },
                },
              },
            },
          });
        }),
      ),
    ),
  );
};

exports.down = function (db) {
  // Down migration does NOT go back to old state, instead just removes all overlays.
  const ids = [true, false].reduce(
    (existing, isProvinceLevel) => [
      ...existing,
      ...NEW_OVERLAYS.map(o => `${o.baseId}${isProvinceLevel ? '_Province' : '_District'}`),
    ],
    [],
  );

  return db.runSql(`	
    DELETE FROM "mapOverlay" WHERE "id" in (${arrayToDbString(ids)});	
  `);
};

exports._meta = {
  version: 1,
};
