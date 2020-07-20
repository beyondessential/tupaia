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
  mapOverlayGroupRelations,
  accessibleMapOverlays,
) => {
  const results = [];

  if (!mapOverlayGroupRelations || !mapOverlayGroupRelations.length) {
    return results;
  }

  const mapOverlayItemIds = mapOverlayGroupRelations.map(m => m.child_id);

  const areMapOverlays = checkRelationsChildType(mapOverlayGroupRelations, 'mapOverlay');

  //If all of the connections are mapOverlays, this means we have reached the lowest level of the hierarchy
  if (areMapOverlays) {
    const mapOverlays = Object.values(accessibleMapOverlays).filter(mapOverlay =>
      mapOverlayItemIds.includes(mapOverlay.id),
    );

    return translateOverlaysForResponse(mapOverlays);
  }

  //Find all the child MapOverlayGroups
  const mapOverlayGroups = await mapOverlayGroupModel.find({
    id: mapOverlayItemIds,
  });

  const mapOverlayGroupIdToName = reduceToDictionary(mapOverlayGroups, 'id', 'name');

  //Recursively find the children of the current MapOverlayGroups
  for (let i = 0; i < mapOverlayGroupRelations.length; i++) {
    const mapOverlayGroupRelation = mapOverlayGroupRelations[i];
    const name = mapOverlayGroupIdToName[mapOverlayGroupRelation.child_id];
    const type = 'mapOverlayGroup';
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

    //If children are all groups, sort by names.
    if (areMapOverlayGroups) {
      children.sort(getSortByKey('name'));
    }

    results.push({
      name,
      type,
      children,
    });
  }

  return results;
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

  return nestedMapOverlayGroups.every(({ type, children }) => {
    if (type === 'mapOverlay') {
      return true;
    }

    return children && children.length > 0 ? checkIfGroupedMapOverlaysAreEmpty(children) : false;
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
        type: 'mapOverlay',
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
  const result = {};

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
      result[name] = nestedMapOverlayGroups;
    }
  }

  return result;
};
