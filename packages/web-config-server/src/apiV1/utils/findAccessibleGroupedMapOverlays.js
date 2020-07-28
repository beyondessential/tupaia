import keyBy from 'lodash.keyby';
import groupBy from 'lodash.groupby';

import { QUERY_CONJUNCTIONS } from '@tupaia/database';
import { reduceToDictionary, getSortByKey } from '@tupaia/utils';

const { AND, RAW } = QUERY_CONJUNCTIONS;

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
    const mapOverlayGroups = await models.mapOverlayGroup.find({
      id: mapOverlayGroupIds,
    });

    const mapOverlayGroupIdToName = reduceToDictionary(mapOverlayGroups, 'id', 'name');

    //Recursively find the children of the current MapOverlayGroups
    for (let i = 0; i < mapOverlayGroupRelations.length; i++) {
      const mapOverlayGroupRelation = mapOverlayGroupRelations[i];
      const name = mapOverlayGroupIdToName[mapOverlayGroupRelation.child_id];
      const childMapOverlayGroupRelations = await models.mapOverlayGroupRelation.findChildRelations(
        mapOverlayGroupRelation.child_id,
      );
      const children = await findNestedGroupedMapOverlays(
        models,
        childMapOverlayGroupRelations,
        accessibleMapOverlays,
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
  //Find all the top level Map Overlay Groups
  const mapOverlayGroups = await models.mapOverlayGroup.findTopLevelMapOverlayGroups();
  const mapOverlayGroupIdToName = reduceToDictionary(mapOverlayGroups, 'id', 'name');
  const mapOverlayGroupIds = mapOverlayGroups.map(mapOverlayGroup => mapOverlayGroup.id);
  const mapOverlayGroupRelations = await models.mapOverlayGroupRelation.findGroupRelations(
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
      models,
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
