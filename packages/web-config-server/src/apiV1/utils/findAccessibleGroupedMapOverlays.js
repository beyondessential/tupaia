import keyBy from 'lodash.keyby';
import groupBy from 'lodash.groupby';
import isEqual from 'lodash.isequal';

import { QUERY_CONJUNCTIONS } from '@tupaia/database';
import { reduceToDictionary, getSortByKey } from '@tupaia/utils';

const { AND, RAW } = QUERY_CONJUNCTIONS;
const INFO = 'info';
const REFERENCE = 'reference';
/**
 * Recursively find the nested grouped MapOverlays.
 */
const findNestedGroupedMapOverlays = async (
  models,
  mapOverlayItemRelations,
  accessibleMapOverlays,
) => {
  let mapOverlayResults = [];
  const mapOverlayGroupResults = [];

  if (!mapOverlayItemRelations || !mapOverlayItemRelations.length) {
    return [];
  }

  const mapOverlayRelations = mapOverlayItemRelations.filter(m => m.child_type === 'mapOverlay');

  // If there are map overlay relations, add them to the results
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

  // If there are map overlay group relations, recursively find the nested groups
  if (mapOverlayGroupRelations.length) {
    const mapOverlayGroupIds = mapOverlayGroupRelations.map(m => m.child_id);

    // Find all the child MapOverlayGroups
    const mapOverlayGroups = await models.mapOverlayGroup.find({
      id: mapOverlayGroupIds,
    });

    const mapOverlayGroupIdToName = reduceToDictionary(mapOverlayGroups, 'id', 'name');

    // Recursively find the children of the current MapOverlayGroups
    for (let i = 0; i < mapOverlayGroupRelations.length; i++) {
      const mapOverlayGroupRelation = mapOverlayGroupRelations[i];
      const name = mapOverlayGroupIdToName[mapOverlayGroupRelation.child_id];
      const childMapOverlayGroupRelations = await mapOverlayGroupRelation.findChildRelations();
      const children = await findNestedGroupedMapOverlays(
        models,
        childMapOverlayGroupRelations,
        accessibleMapOverlays,
      );
      const mapOverlayGroupResult = integrateMapOverlayItemsReference({
        id: mapOverlayGroupRelation.child_id,
        groupName: name,
        children,
      });
      mapOverlayGroupResults.push(mapOverlayGroupResult);
    }
  }
  const sortedMapOverlayResults = sortMapOverlayItems(
    mapOverlayGroupResults.concat(mapOverlayResults),
    mapOverlayItemRelations,
  );
  return sortedMapOverlayResults.map(item => {
    const { id: mapOverlayId, ...itemToReturn } = item;
    return { mapOverlayId, ...itemToReturn };
  });
};

/**
 * We will only display reference info on topper level map overlay group, if all `mapOverlayItem` have same reference.
 *
 * In this function, variable `mapOverlayItem` is an abstract item that can be either map overlay or map overlay group
 *
 * @param children an array of variable `mapOverlayItem`
 */
const integrateMapOverlayItemsReference = ({ id, groupName, children }) => {
  const mapOverlayGroupResult = {
    id,
    name: groupName,
  };
  const getReference = mapOverlayItem => {
    if (mapOverlayItem[INFO] && mapOverlayItem[INFO][REFERENCE])
      return mapOverlayItem[INFO][REFERENCE];
    return null;
  };
  const firstReference = Array.isArray(children) && children[0] && getReference(children[0]);
  if (firstReference) {
    const referencesAreTheSame = children.every(
      mapOverlayItem =>
        getReference(mapOverlayItem) && isEqual(getReference(mapOverlayItem), firstReference),
    );

    // All map overlays have same reference
    if (referencesAreTheSame) {
      // Delete all the same references
      const noReferenceMapOverlayItems = children.map(mapOverlayItem => {
        const { [INFO]: info, ...restValues } = mapOverlayItem;
        delete info[REFERENCE];
        return { ...restValues, info };
      });
      return {
        ...mapOverlayGroupResult,
        children: noReferenceMapOverlayItems,
        [INFO]: { [REFERENCE]: firstReference },
      };
    }
  }
  return {
    ...mapOverlayGroupResult,
    children,
  };
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

/**
 * Sort map overlays/map overlay groups with sort_order first, then the ones without sort_order alphabetically
 * @param {*} mapOverlayItems
 * @param {*} relations
 */
const sortMapOverlayItems = (mapOverlayItems, relations) => {
  const childIdToSortOrder = reduceToDictionary(relations, 'child_id', 'sort_order');
  const sortedOverlaysByOrder = mapOverlayItems
    .filter(m => childIdToSortOrder[m.id] !== null)
    .sort((m1, m2) => childIdToSortOrder[m1.id] - childIdToSortOrder[m2.id]);
  const sortedOverlaysAlphabetically = mapOverlayItems
    .filter(m => childIdToSortOrder[m.id] === null)
    .sort(getSortByKey('name'));

  return [...sortedOverlaysByOrder, ...sortedOverlaysAlphabetically];
};

const translateOverlaysForResponse = mapOverlays =>
  mapOverlays
    .filter(({ presentationOptions: { hideFromMenu } }) => !hideFromMenu)
    .map(({ id, name, presentationOptions }) => ({
      id, // just for sorting purpose, will be removed later
      name,
      ...presentationOptions,
    }));

/**
 * Find accessible Map Overlays that have matched entityCode, projectCode and userGroups
 */
export const findAccessibleMapOverlays = async (models, overlayCode, projectCode, userGroups) => {
  const mapOverlays = await models.mapOverlay.find({
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
export const findAccessibleGroupedMapOverlays = async (models, accessibleMapOverlays) => {
  // Find all the top level Map Overlay Groups
  const mapOverlayGroups = await models.mapOverlayGroup.findTopLevelMapOverlayGroups();
  const mapOverlayGroupIdToName = reduceToDictionary(mapOverlayGroups, 'id', 'name');
  const mapOverlayGroupIds = mapOverlayGroups.map(mapOverlayGroup => mapOverlayGroup.id);
  const mapOverlayGroupRelations = await models.mapOverlayGroupRelation.findGroupRelations(
    mapOverlayGroupIds,
  );
  const relationsByGroupId = groupBy(mapOverlayGroupRelations, 'map_overlay_group_id');
  const worldToTopLevelGroupRelations = await models.mapOverlayGroupRelation.findTopLevelMapOverlayGroupRelations();
  const worldRelationById = keyBy(worldToTopLevelGroupRelations, 'child_id'); // child_id should be unique because these are top level overlay groups
  const groupIds = Object.keys(relationsByGroupId);
  const accessibleOverlayGroups = [];
  const accessibleRelations = [];

  for (let i = 0; i < groupIds.length; i++) {
    const groupId = groupIds[i];
    const name = mapOverlayGroupIdToName[groupId];
    const groupRelations = relationsByGroupId[groupId];
    const nestedMapOverlayGroups = await findNestedGroupedMapOverlays(
      models,
      groupRelations,
      accessibleMapOverlays,
    );

    const isNonEmptyMapOverlayGroup = checkIfGroupedMapOverlaysAreEmpty(nestedMapOverlayGroups);

    if (isNonEmptyMapOverlayGroup) {
      accessibleRelations.push(worldRelationById[groupId]);
      const accessibleOverlayGroup = integrateMapOverlayItemsReference({
        id: groupId,
        groupName: name,
        children: nestedMapOverlayGroups,
      });
      accessibleOverlayGroups.push(accessibleOverlayGroup);
    }
  }

  const sortedGroups = sortMapOverlayItems(accessibleOverlayGroups, accessibleRelations);
  return sortedGroups.map(og => {
    const { id, ...restOfOverlayGroup } = og;
    return restOfOverlayGroup;
  });
};
