import keyBy from 'lodash.keyby';
import groupBy from 'lodash.groupby';

import { QUERY_CONJUNCTIONS } from '@tupaia/database';
import { reduceToDictionary, getSortByKey } from '@tupaia/utils';

const { AND, RAW } = QUERY_CONJUNCTIONS;

/**
 * Recursively find the nested grouped MapOverlays.
 */
const findNestedGroupedMapOverlays = async (
  mapOverlayGroupModel,
  mapOverlayGroupRelationModel,
  mapOverlayItemRelations,
  accessibleMapOverlays,
) => {
  let mapOverlayResults = [];
  let mapOverlayGroupResults = [];

  if (!mapOverlayItemRelations || !mapOverlayItemRelations.length) {
    return [];
  }

  const mapOverlayRelations = mapOverlayItemRelations.filter(m => m.child_type === 'mapOverlay');

  //If there are map overlay relations, add them to the results
  if (mapOverlayRelations.length) {
    const mapOverlayIds = mapOverlayRelations.map(m => m.child_id);

    const mapOverlays = Object.values(accessibleMapOverlays).filter(mapOverlay =>
      mapOverlayIds.includes(mapOverlay.id),
    );

    mapOverlayResults = translateOverlaysForResponse(mapOverlays);
  }

  const mapOverlayGroupRelations = mapOverlayItemRelations.filter(
    m => m.child_type === 'mapOverlayGroup',
  );

  //If there are map overlay group relations, recursively find the nested groups
  if (mapOverlayGroupRelations.length) {
    const mapOverlayGroupIds = mapOverlayGroupRelations.map(m => m.child_id);

    //Find all the child MapOverlayGroups
    const mapOverlayGroups = await mapOverlayGroupModel.find({
      id: mapOverlayGroupIds,
    });

    const mapOverlayGroupIdToName = reduceToDictionary(mapOverlayGroups, 'id', 'name');

    //Recursively find the children of the current MapOverlayGroups
    for (let i = 0; i < mapOverlayGroupRelations.length; i++) {
      const mapOverlayGroupRelation = mapOverlayGroupRelations[i];
      const name = mapOverlayGroupIdToName[mapOverlayGroupRelation.child_id];
      const childMapOverlayGroupRelations = await mapOverlayGroupRelationModel.find({
        map_overlay_group_id: {
          comparator: '=',
          comparisonValue: mapOverlayGroupRelation.child_id,
        },
      });
      const children = await findNestedGroupedMapOverlays(
        mapOverlayGroupModel,
        mapOverlayGroupRelationModel,
        childMapOverlayGroupRelations,
        accessibleMapOverlays,
      );
      const areMapOverlayGroups = checkRelationsChildType(
        childMapOverlayGroupRelations,
        'mapOverlayGroup',
      );

      mapOverlayGroupResults.push({
        name,
        children,
      });
    }
  }

  //Sort the groups by names.
  if (mapOverlayGroupResults.length) {
    mapOverlayGroupResults.sort(getSortByKey('name'));
  }

  //Concat the groups and the overlays so that Groups are always on top of Overlays. 
  //Overlays are already sorted by sortOrder at this stage
  return mapOverlayGroupResults.concat(mapOverlayResults);
};

const checkRelationsChildType = (connections, childType) => {
  return connections.every(
    mapOverlayGroupConnection => mapOverlayGroupConnection.child_type === childType,
  );
};

const checkIfGroupedMapOverlaysAreEmpty = nestedMapOverlayGroups => {
  if (!nestedMapOverlayGroups || !nestedMapOverlayGroups.length) {
    return false;
  }

  return nestedMapOverlayGroups.every(({ children }) => {
    if (!children) {
      return true;
    }

    return children.length > 0 ? checkIfGroupedMapOverlaysAreEmpty(children) : false;
  });
};

const translateOverlaysForResponse = mapOverlays =>
  mapOverlays
    .filter(({ presentationOptions: { hideFromMenu } }) => !hideFromMenu)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map(({ id, name, linkedMeasures, presentationOptions }) => {
      const idString = [id, ...(linkedMeasures || [])].sort().join(',');

      return {
        measureId: idString,
        name,
        ...presentationOptions,
      };
    });

/**
 * Find accessible Map Overlays that have matched entityCode, projectCode and userGroups
 */
export const findAccessibleMapOverlays = async (
  mapOverlayModel,
  overlayCode,
  projectCode,
  userGroups,
) => {
  const mapOverlays = await mapOverlayModel.find({
    [RAW]: {
      sql: `("userGroup" = '' OR "userGroup" IN (${userGroups.map(() => '?').join(',')}))`, // turn `['Public', 'Donor', 'Admin']` into `?,?,?` for binding
      parameters: userGroups,
    },
    [AND]: {
      [RAW]: {
        sql: '"countryCodes" IS NULL OR :overlayCode = ANY("countryCodes")',
        parameters: {
          overlayCode,
        },
      },
      [AND]: {
        projectCodes: {
          comparator: '@>',
          comparisonValue: [projectCode],
        },
      },
    },
  });

  return keyBy(mapOverlays, 'id');
};

/**
 * Find accessible grouped MapOverlays, starting from the top level MapOverlayGroups
 */
export const findAccessibleGroupedMapOverlays = async (
  mapOverlayGroupModel,
  mapOverlayGroupRelationModel,
  accessibleMapOverlays,
) => {
  //Find all the top level Map Overlay Groups
  const mapOverlayGroups = await mapOverlayGroupModel.findTopLevelMapOverlayGroups();
  const mapOverlayGroupIdToName = reduceToDictionary(mapOverlayGroups, 'id', 'name');
  const mapOverlayGroupIds = mapOverlayGroups.map(mapOverlayGroup => mapOverlayGroup.id);
  const mapOverlayGroupRelations = await mapOverlayGroupRelationModel.findChildRelations(
    mapOverlayGroupIds,
  );
  const relationsByGroupId = groupBy(mapOverlayGroupRelations, 'map_overlay_group_id');
  const groupIds = Object.keys(relationsByGroupId);
  const result = [];

  for (let i = 0; i < groupIds.length; i++) {
    const groupId = groupIds[i];
    const name = mapOverlayGroupIdToName[groupId];
    const groupRelations = relationsByGroupId[groupId];
    const nestedMapOverlayGroups = await findNestedGroupedMapOverlays(
      mapOverlayGroupModel,
      mapOverlayGroupRelationModel,
      groupRelations,
      accessibleMapOverlays,
    );

    const isNonEmptyMapOverlayGroup = checkIfGroupedMapOverlaysAreEmpty(nestedMapOverlayGroups);

    if (isNonEmptyMapOverlayGroup) {
      result.push({
        name,
        children: nestedMapOverlayGroups,
      });
    }
  }

  return result;
};
