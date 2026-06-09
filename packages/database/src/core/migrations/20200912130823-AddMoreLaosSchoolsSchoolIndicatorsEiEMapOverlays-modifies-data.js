'use strict';

import { insertObject, arrayToDbString, generateId, codeToId } from '../utilities';

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

const DEFAULT_VALUES = [
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

const SCHOOL_IMPLEMENTING_MOES_MAP_OVERLAY_VALUES = [
  {
    name: 'Yes, fully',
    color: 'green',
    value: 'Yes, fully',
  },
  {
    name: 'Yes, partially',
    color: 'yellow',
    value: 'Yes, partially',
  },
  {
    name: 'No',
    color: 'red',
    value: 'No',
  },
];

const ACCESS_TO_CLEAN_DRINKING_WATER_MAP_OVERLAY_VALUES = [
  {
    name: 'Tap water',
    color: 'green',
    value: 'Tap water',
  },
  {
    name: 'Bottle water provided by school',
    color: 'yellow',
    value: 'Bottle water provided by school',
  },
  {
    name: 'Filtered or boiled water',
    color: 'blue',
    value: 'Filtered or boiled water',
  },
  {
    name: 'Clean water from home',
    color: 'teal',
    value: 'Clean water from home',
  },
  {
    name: 'No',
    color: 'red',
    value: 'No',
  },
];

const DEFAULT_MEASURE_BUILDER_CONFIG = {
  entityAggregation: {
    dataSourceEntityType: 'school',
  },
};

const ACCESS_TO_CLEAN_DRINKING_WATER_MAP_OVERLAY_MEASURE_BUILDER_CONFIG = {
  entityAggregation: {
    dataSourceEntityType: 'school',
  },
  dataElementCodes: ['SchCVD028', 'SchCVD029'],
  filter: {
    value: {
      in: [
        'Tap water',
        'Bottle water provided by school',
        'Filtered or boiled water',
        'Clean water from home',
        'No',
      ],
    },
  },
};

const MAP_OVERLAYS = [
  {
    id: 'Laos_Schools_School_Indicators_EiE_Additional_Reading_Materials_June_2020',
    name: 'Additional reading materials received since June 2020',
    dataElementCode: 'SchCVD004b',
    values: DEFAULT_VALUES,
    measureBuilderConfig: DEFAULT_MEASURE_BUILDER_CONFIG,
  },
  {
    id: 'Laos_Schools_School_Indicators_EiE_Access_To_Water_Supply_All_Year_Round',
    name: 'Access to water supply all year round',
    dataElementCode: 'SchCVD010l',
    values: DEFAULT_VALUES,
    measureBuilderConfig: DEFAULT_MEASURE_BUILDER_CONFIG,
  },
  {
    id: 'Laos_Schools_School_Indicators_EiE_Lao_Satellite_Receiver_And_Dish_Set',
    name: 'Lao satellite receiver and dish set',
    dataElementCode: 'SchCVD012b',
    values: DEFAULT_VALUES,
    measureBuilderConfig: DEFAULT_MEASURE_BUILDER_CONFIG,
  },
  {
    id: 'Laos_Schools_School_Indicators_EiE_School_Implementing_MOES',
    name: 'School implementing MoES safe school protocols/guidelines',
    dataElementCode: 'SchCVD027',
    values: SCHOOL_IMPLEMENTING_MOES_MAP_OVERLAY_VALUES,
    measureBuilderConfig: DEFAULT_MEASURE_BUILDER_CONFIG,
  },
  {
    id: 'Laos_Schools_School_Indicators_EiE_Access_To_Clean_Drinking_Water',
    name: 'Access to clean drinking water',
    dataElementCode: 'value',
    values: ACCESS_TO_CLEAN_DRINKING_WATER_MAP_OVERLAY_VALUES,
    measureBuilderConfig: ACCESS_TO_CLEAN_DRINKING_WATER_MAP_OVERLAY_MEASURE_BUILDER_CONFIG,
  },
];

const USER_GROUP = 'Laos Schools User';

const MEASURE_BUILDER = 'valueForOrgGroup';

const COUNTRY_CODES = '{"LA"}';

const PROJECT_CODES = '{"laos_schools"}';

const SCHOOL_INDICATORS_EIE_GROUP_CODE = 'School_Indicators_EiE';

const BASE_PRESENTATION_OPTIONS = {
  hideByDefault: {
    null: true,
  },
  measureLevel: 'School',
  displayOnLevel: 'District',
  displayType: 'color',
};

const BASE_OVERLAY = {
  userGroup: USER_GROUP,
  isDataRegional: true,
  measureBuilder: MEASURE_BUILDER,
  countryCodes: COUNTRY_CODES,
  projectCodes: PROJECT_CODES,
};

const getLargestSortOrderInOverlayGroup = async (db, groupCode) => {
  const results = await db.runSql(
    `SELECT "sortOrder" FROM "mapOverlay" 
    INNER JOIN map_overlay_group_relation ON map_overlay_group_relation.child_id = "mapOverlay".id 
    INNER JOIN map_overlay_group ON map_overlay_group.id = map_overlay_group_relation.map_overlay_group_id 
    WHERE map_overlay_group.code = '${groupCode}' 
    ORDER BY "sortOrder" DESC LIMIT 1;`,
  );

  return results.rows[0].sortOrder;
};

exports.up = async function (db) {
  const maxSortOrder = await getLargestSortOrderInOverlayGroup(
    db,
    SCHOOL_INDICATORS_EIE_GROUP_CODE,
  );

  for (let index = 0; index < MAP_OVERLAYS.length; index++) {
    const overlay = MAP_OVERLAYS[index];
    const { id: overlayId, name, dataElementCode, measureBuilderConfig, values } = overlay;
    await insertObject(db, 'mapOverlay', {
      ...BASE_OVERLAY,
      name,
      id: overlayId,
      sortOrder: index + maxSortOrder + 1,
      dataElementCode,
      measureBuilderConfig,
      presentationOptions: {
        ...BASE_PRESENTATION_OPTIONS,
        values,
      },
    });

    const overlayGroupId = await codeToId(
      db,
      'map_overlay_group',
      SCHOOL_INDICATORS_EIE_GROUP_CODE,
    );

    await insertObject(db, 'map_overlay_group_relation', {
      id: generateId(),
      map_overlay_group_id: overlayGroupId,
      child_id: overlayId,
      child_type: 'mapOverlay',
    });
  }
};

exports.down = function (db) {
  return db.runSql(
    `	
    DELETE FROM "mapOverlay" 
    WHERE "id" IN (${arrayToDbString(MAP_OVERLAYS.map(o => o.id))});

    DELETE FROM "map_overlay_group_relation" 
    WHERE "child_id" IN (${arrayToDbString(MAP_OVERLAYS.map(o => o.id))});	
  `,
  );
};

exports._meta = {
  version: 1,
};
