import isEqual from 'lodash.isequal';
import orderBy from 'lodash.orderby';

import { reduceToDictionary } from '@tupaia/utils';

const INFO = 'info';
const REFERENCE = 'reference';
/**
 * Recursively find the nested grouped MapOverlays.
 */
const findNestedGroupedMapOverlays = async (
  models,
  mapOverlayItemRelations,
  country,
  permissionGroups,
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

    const mapOverlays = await models.mapOverlay.find({
      id: mapOverlayIds,
      country_codes: { comparator: '@>', comparisonValue: [country] },
    });
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
      const childMapOverlayGroupRelations = await models.mapOverlayGroupRelation.findGroupRelations(
        [mapOverlayGroupRelation.child_id],
        permissionGroups,
      );
      const children = await findNestedGroupedMapOverlays(
        models,
        childMapOverlayGroupRelations,
        country,
        permissionGroups,
      );

      if (children.length > 0) {
        const mapOverlayGroupResult = integrateMapOverlayItemsReference({
          id: mapOverlayGroupRelation.child_id,
          groupName: name,
          children,
        });
        mapOverlayGroupResults.push(mapOverlayGroupResult);
      }
    }
  }
  const sortedMapOverlayResults = sortMapOverlayItems(
    mapOverlayGroupResults.concat(mapOverlayResults),
    mapOverlayItemRelations,
  );

  return sortedMapOverlayResults.map(item => {
    const { id, code: mapOverlayCode, ...itemToReturn } = item;
    return { mapOverlayCode, ...itemToReturn };
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

/**
 * Sort map overlays/map overlay groups with sort_order first, then alphabetically
 * @param {*} mapOverlayItems
 * @param {*} relations
 */
const sortMapOverlayItems = (mapOverlayItems, relations) => {
  const childIdToSortOrder = reduceToDictionary(relations, 'child_id', 'sort_order');
  // Momentarily add sort order so we can use orderBy
  const overlaysWithSortOrder = mapOverlayItems.map(overlay => ({
    ...overlay,
    sort_order: childIdToSortOrder[overlay.id],
  }));
  const sortedOverlays = orderBy(overlaysWithSortOrder, ['sort_order', 'name']);

  // Remove sort order from overlays before return
  return sortedOverlays.map(overlay => {
    const { sort_order: sortOrder, ...restOfOverlay } = overlay;
    return restOfOverlay;
  });
};

const translateOverlaysForResponse = mapOverlays =>
  mapOverlays
    .filter(({ config: { hideFromMenu } }) => !hideFromMenu)
    .map(({ id, code, name, config, report_code: reportCode, legacy }) => ({
      id, // just for lookup purpose, will be removed later
      code,
      name,
      ...config,
      reportCode,
      legacy,
    }));

/**
 * Find accessible Map Overlays that have matched entityCode, projectCode and permissionGroups
 */
export const findAccessibleMapOverlays = async (models, projectCode, country, permissionGroups) => {
  const projectMapOverlayGroup = await models.mapOverlayGroup.findOne({ code: projectCode });
  const projectRelations = await models.mapOverlayGroupRelation.findGroupRelations(
    [projectMapOverlayGroup.id],
    permissionGroups,
  );

  const mapOverlayHierarchy = await findNestedGroupedMapOverlays(
    models,
    projectRelations,
    country,
    permissionGroups,
  );

  return mapOverlayHierarchy;
};
