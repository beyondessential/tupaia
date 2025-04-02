'use strict';

import { insertObject, arrayToDbString } from '../utilities';

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

const DATA_ELEMENT_CODE = 'SchCVD026a';

const NAME = 'Telephone Available';

const VALUES = [
  {
    name: 'Yes',
    color: 'green',
    value: 'Yes',
  },
  {
    name: 'No',
    color: 'red',
    value: 'No',
  },
];

const BASIC_LAOS_SCHOOL_MAP_OVERLAY_OBJECT = {
  userGroup: 'Laos Schools User',
  name: NAME,
  isDataRegional: true,
  values: VALUES,
  countryCodes: '{"LA"}',
  projectCodes: '{"laos_schools"}',
  sortOrder: 100,
};

const TO_INSERT = [
  {
    // issue: 597,
    object: {
      ...BASIC_LAOS_SCHOOL_MAP_OVERLAY_OBJECT,
      id: 'Laos_Schools_Telephone_Available',
      groupName: 'School Indicators',
      dataElementCode: DATA_ELEMENT_CODE,
      displayType: 'color',
      measureBuilder: 'valueForOrgGroup',
      measureBuilderConfig: {
        entityAggregation: {
          dataSourceEntityType: 'school',
        },
      },
      presentationOptions: {
        hideByDefault: {
          null: true,
        },
        measureLevel: 'School',
        displayOnLevel: 'District',
        popupHeaderFormat: '{code}: {name}',
      },
    },
    tableName: 'mapOverlay',
  },
  {
    // issue: 599 : Province,
    object: {
      ...BASIC_LAOS_SCHOOL_MAP_OVERLAY_OBJECT,
      dataElementCode: 'value',
      id: 'Laos_Schools_Telephone_Available_Province',
      groupName: 'School Indicators by Province',
      displayType: 'shading',
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
      presentationOptions: {
        displayedValueKey: 'originalValue',
        valueType: 'fractionAndPercentage',
        disableRenameLegend: true,
        measureLevel: 'District', // Means province
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
                  aggregationEntityType: 'district', // Means province
                  dataSourceEntityType: 'school',
                  aggregationType: 'SUM_PER_ORG_GROUP',
                  aggregationConfig: {
                    valueToMatch: 'Yes',
                  },
                },
                dataElementCodes: [DATA_ELEMENT_CODE],
              },
            },
            denominator: {
              measureBuilder: 'sumLatestPerOrgUnit',
              measureBuilderConfig: {
                entityAggregation: {
                  aggregationEntityType: 'district', // Means province
                  dataSourceEntityType: 'school',
                  aggregationType: 'SUM_PER_ORG_GROUP',
                  aggregationConfig: {
                    valueToMatch: '*',
                  },
                },
                dataElementCodes: [DATA_ELEMENT_CODE],
              },
            },
          },
        },
      },
    },
    tableName: 'mapOverlay',
  },
  {
    // issue: 599 : District,
    object: {
      ...BASIC_LAOS_SCHOOL_MAP_OVERLAY_OBJECT,
      dataElementCode: 'value',
      id: 'Laos_Schools_Telephone_Available_District',
      groupName: 'School Indicators by District',
      displayType: 'shading',
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
      presentationOptions: {
        displayedValueKey: 'originalValue',
        valueType: 'fractionAndPercentage',
        disableRenameLegend: true,
        measureLevel: 'SubDistrict', // Means district
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
                  aggregationEntityType: 'sub_district', // Means district
                  dataSourceEntityType: 'school',
                  aggregationType: 'SUM_PER_ORG_GROUP',
                  aggregationConfig: {
                    valueToMatch: 'Yes',
                  },
                },
                dataElementCodes: [DATA_ELEMENT_CODE],
              },
            },
            denominator: {
              measureBuilder: 'sumLatestPerOrgUnit',
              measureBuilderConfig: {
                entityAggregation: {
                  aggregationEntityType: 'sub_district', // Means district
                  dataSourceEntityType: 'school',
                  aggregationType: 'SUM_PER_ORG_GROUP',
                  aggregationConfig: {
                    valueToMatch: '*',
                  },
                },
                dataElementCodes: [DATA_ELEMENT_CODE],
              },
            },
          },
        },
      },
    },
    tableName: 'mapOverlay',
  },
];

// 618
const BAR_CHART_IDS = [
  'LA_Laos_Schools_Service_Availability_Percentage_Preschool',
  'LA_Laos_Schools_Service_Availability_Percentage_Primary',
  'LA_Laos_Schools_Service_Availability_Percentage_Secondary',
];

const BAR_CHART_CONFIG = {
  numerator: {
    dataValues: [DATA_ELEMENT_CODE],
    valueOfInterest: 'Yes',
  },
  denominator: {
    dataValues: [DATA_ELEMENT_CODE],
    valueOfInterest: '*',
  },
};

exports.up = async function (db) {
  // Issues 597, 599
  await Promise.all(TO_INSERT.map(({ tableName, object }) => insertObject(db, tableName, object)));
  // Issue 618
  await db.runSql(`
    update 
      "dashboardReport"
    set
      "dataBuilderConfig" = jsonb_set("dataBuilderConfig", '{dataClasses,${NAME}}','${JSON.stringify(
    BAR_CHART_CONFIG,
  )}')
    where 
      id in (${arrayToDbString(BAR_CHART_IDS)});
  `);
  // Issue 609: Will be deleted, don't worry about it
  // Issue 611 - Card not merged yet so will make changes there
};

exports.down = async function (db) {
  // Issues 597, 599
  await db.runSql(`	
    DELETE FROM "mapOverlay" 
    WHERE "id" in (${arrayToDbString(TO_INSERT.map(o => o.object.id))});	
  `);
  // Issue 618
  await db.runSql(`
    update 
      "dashboardReport"
    set
      "dataBuilderConfig" = "dataBuilderConfig" #- '{dataClasses,${NAME}}'
    where 
      id in (${arrayToDbString(BAR_CHART_IDS)});
  `);
  // Issue 609: Will be deleted, don't worry about it
  // Issue 611 - Card not merged yet so will make changes there
};

exports._meta = {
  version: 1,
};
