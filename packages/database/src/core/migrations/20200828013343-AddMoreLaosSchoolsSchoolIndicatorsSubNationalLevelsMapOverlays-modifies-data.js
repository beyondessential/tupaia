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

const NEW_OVERLAYS = [
  {
    dataElementCodes: ['SchCVD004b'],
    name: 'Additional learning and reading materials received since June 2020',
    id:
      'Laos_Schools_School_Indicators_Sub_National_Addtional_Learning_Reading_Materials_Since_June_2020',
  },
  {
    dataElementCodes: ['SchCVD027'],
    name: 'School implementing MoES safe school protocols/guidelines',
    id: 'Laos_Schools_School_Indicators_Sub_National_School_Implement_MOES_Protocols_Guidelines',
  },
  {
    dataElementCodes: ['SchCVD010l'],
    name: 'Access to water supply all year round',
    id: 'Laos_Schools_School_Indicators_Sub_National_Access_To_Water_Supply_All_Year',
  },
  {
    dataElementCodes: ['SchCVD028'],
    name: 'Access to clean drinking water',
    id: 'Laos_Schools_School_Indicators_Sub_National_Access_To_Clean_Drinking_Water',
  },
  {
    dataElementCodes: ['SchCVD012b'],
    name: 'Lao satellite receiver and dish set',
    id: 'Laos_Schools_School_Indicators_Sub_National_Lao_Satellite_Receiver_Dish_Set',
  },
];

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
const BASE_OVERLAY = {
  userGroup: 'Laos Schools User',
  dataElementCode: 'value',
  isDataRegional: true,
  measureBuilder: 'groupData',
  countryCodes: '{LA}',
  projectCodes: '{laos_schools}',
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

const getOverlayId = (id, level) => {
  const overlayIdSuffix = level === 'province' ? 'Province' : 'District';
  return `${id}_${overlayIdSuffix}`;
};

const addOverlaysByLevel = async (db, level, groupCode) => {
  const aggregationEntityType = level === 'province' ? 'district' : 'sub_district';
  const measureLevel = level === 'province' ? 'District' : 'SubDistrict';
  const maxSortOrder = await getLargestSortOrderInOverlayGroup(db, groupCode);

  for (let index = 0; index < NEW_OVERLAYS.length; index++) {
    const overlay = NEW_OVERLAYS[index];
    const { id, name, dataElementCodes } = overlay;
    const overlayId = getOverlayId(id, level);
    await insertObject(db, 'mapOverlay', {
      ...BASE_OVERLAY,
      name,
      id: overlayId,
      sortOrder: index + maxSortOrder + 1,
      measureBuilderConfig: {
        groups: {
          '<20': {
            value: 0.2,
            operator: '<',
          },
          '>80': {
            value: 0.8,
            operator: '>',
          },
          '20-40': {
            value: [0.2, 0.4],
            operator: 'range',
          },
          '40-60': {
            value: [0.4, 0.6],
            operator: 'range',
          },
          '60-80': {
            value: [0.6, 0.8],
            operator: 'range',
          },
        },
        measureBuilder: 'composePercentagePerOrgUnit',
        measureBuilderConfig: {
          measureBuilders: {
            numerator: {
              measureBuilder: 'sumLatestPerOrgUnit',
              measureBuilderConfig: {
                dataElementCodes,
                entityAggregation: {
                  aggregationType: 'SUM_PER_ORG_GROUP',
                  aggregationConfig: {
                    valueToMatch: 'Yes',
                  },
                  dataSourceEntityType: 'school',
                  aggregationEntityType,
                },
              },
            },
            denominator: {
              measureBuilder: 'sumLatestPerOrgUnit',
              measureBuilderConfig: {
                dataElementCodes,
                entityAggregation: {
                  aggregationType: 'SUM_PER_ORG_GROUP',
                  aggregationConfig: {
                    valueToMatch: '*',
                  },
                  dataSourceEntityType: 'school',
                  aggregationEntityType,
                },
              },
            },
          },
        },
      },
      presentationOptions: {
        values: [
          {
            name: '0-20%',
            color: 'Red',
            value: '<20',
          },
          {
            name: '21-40%',
            color: 'Orange',
            value: '20-40',
          },
          {
            name: '41-60%',
            color: 'Yellow',
            value: '40-60',
          },
          {
            name: '61-80%',
            color: 'Lime',
            value: '60-80',
          },
          {
            name: '81-100%',
            color: 'Green',
            value: '>80',
          },
        ],
        valueType: 'fractionAndPercentage',
        displayType: 'shading',
        measureLevel,
        displayedValueKey: 'originalValue',
        disableRenameLegend: true,
      },
    });

    const overlayGroupId = await codeToId(db, 'map_overlay_group', groupCode);

    await insertObject(db, 'map_overlay_group_relation', {
      id: generateId(),
      map_overlay_group_id: overlayGroupId,
      child_id: overlayId,
      child_type: 'mapOverlay',
    });
  }
};
exports.up = async function (db) {
  await addOverlaysByLevel(db, 'district', 'School_Indicators_by_District');
  await addOverlaysByLevel(db, 'province', 'School_Indicators_by_Province');
};

exports.down = function (db) {
  const overlayIds = [];

  NEW_OVERLAYS.forEach(o => {
    const overlayIdDistrict = getOverlayId(o.id, 'district');
    const overlayIdProvince = getOverlayId(o.id, 'province');

    overlayIds.push(overlayIdDistrict);
    overlayIds.push(overlayIdProvince);
  });

  return db.runSql(
    `	
    DELETE FROM "mapOverlay" 
    WHERE "id" IN (${arrayToDbString(overlayIds)});

    DELETE FROM "map_overlay_group_relation" 
    WHERE "child_id" IN (${arrayToDbString(overlayIds)});	
  `,
  );
};

exports._meta = {
  version: 1,
};
